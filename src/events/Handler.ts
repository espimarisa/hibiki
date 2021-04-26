/**
 * @file Handler
 * @description Handles and executes commands
 */

import type { Message, TextChannel, User } from "eris";
import { PrivateChannel } from "eris";
import { Event } from "../classes/Event";
import { inviteRegex } from "../utils/constants";
import { wordFilter } from "../scripts/wordFilter";
import * as Sentry from "@sentry/node";

export class HandlerEvent extends Event {
  events = ["messageCreate"];

  async run(_event: string, msg: Message<TextChannel>) {
    if (!msg || !msg.content || msg.author.bot || !msg.channel || !msg.author) return;
    let prefix = "";
    let localeString = "";

    // Finds what locale to use
    const guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild ? msg.channel.guild.id : "");
    const userLocale = await this.bot.localeSystem.getUserLocale(msg.author.id, this.bot, true);
    if (userLocale) localeString = userLocale;
    else if (guildconfig?.guildLocale && !userLocale) localeString = guildconfig.guildLocale;
    const string = this.bot.localeSystem.getLocaleFunction(localeString);
    msg.string = string;

    // DM Specific actions
    if (msg.channel instanceof PrivateChannel) {
      if (inviteRegex.test(msg.content)) {
        msg.createEmbed(
          `📌 ${string("general.INVITE")}`,
          string("general.INVITE_INFO", {
            bot: `https://discord.com/oauth2/authorize?&client_id=${this.bot.user.id}&scope=bot&permissions=1581116663`,
            support: "https://discord.gg/gZEj4sM",
          }),
        );
      }

      // Logs DMs if enabled
      if (this.bot.config.dmLogs === true) {
        this.bot
          .createMessage(this.bot.config.logchannel, {
            embed: {
              description: `${msg.content}`,
              color: msg.convertHex("general"),
              author: {
                icon_url: msg.author.dynamicAvatarURL(),
                name: this.bot.localeSystem.getLocale(this.bot.config.defaultLocale, "global.MESSAGED_BY", {
                  author: msg.tagUser(msg.author),
                }),
              },
              image: {
                url: msg.attachments.length !== 0 ? msg.attachments[0].url : "",
              },
            },
          })
          .catch(() => {});
      }
    }

    // Finds what prefix to use
    const mentionRegex = new RegExp(`<@!?${this.bot.user.id}> ?`);
    const mentionPrefix = mentionRegex.exec(msg.content);
    const prefixes = this.bot.config.prefixes.map((p) => msg.content.toLowerCase().startsWith(p)).indexOf(true);
    if (mentionPrefix?.index === 0) prefix = mentionPrefix?.[0];
    else if (guildconfig?.prefix && msg.content.toLowerCase().startsWith(guildconfig?.prefix)) prefix = guildconfig?.prefix;
    else if (!guildconfig?.prefix && prefixes !== -1) prefix = this.bot.config.prefixes[prefixes];

    // Checks to see if a member is staff
    const isStaff =
      msg.member?.permissions?.has("administrator") || (guildconfig?.staffRole && msg.member?.roles?.includes(guildconfig.staffRole));

    // Checks staff perms and wordFilter
    if (!prefix) return isStaff && !(msg.channel instanceof PrivateChannel) && wordFilter(guildconfig, msg);
    msg.prefix = prefix;

    // Finds the command to run
    const [commandName, ...args] = msg.content.trim().slice(prefix.length).split(/ +/g);
    const command = this.bot.commands.find(
      (cmd) => cmd?.name === commandName.toLowerCase() || cmd?.aliases.includes(commandName.toLowerCase()),
    );

    // Custom command support
    if (msg.channel.guild && guildconfig?.customCommands?.length && !command) {
      const customcmd = guildconfig.customCommands.find((c) => c.name === commandName);
      if (!customcmd) return;

      // Replaces {author}, {random}, {guild}, and {mentioner}
      if (msg.mentions?.[0]) customcmd.content = customcmd.content.replace(/{mentioner}/g, `<@${msg.mentions?.[0]?.id}>`);
      else customcmd.content = customcmd.content.replace(/{mentioner}/g, `<@${msg.author.id}>`);
      customcmd.content = customcmd.content.replace(/{author}/g, `<@${msg.author.id}>`);
      customcmd.content = customcmd.content.replace(/{random}/g, Math.round(Math.random() * 100).toString());
      customcmd.content = customcmd.content.replace(/{guild}/g, msg.channel.guild.name);

      // Sends the command
      return msg.channel.createMessage({
        embed: {
          title: `✨ ${customcmd.name}`,
          description: customcmd.content.substring(0, 2048),
          color: msg.convertHex("general"),
          image: {
            url: customcmd.image,
          },
          footer: {
            text: string("global.CUSTOMCOMMAND_RANBY", {
              author: msg.tagUser(msg.author),
              creator: msg.tagUser(msg.channel.guild.members?.get(customcmd.createdBy)?.user),
            }),
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      });
    }

    // Word filtering
    if (!command) return isStaff && !(msg.channel instanceof PrivateChannel) && wordFilter(guildconfig, msg);

    // Handles owner commands
    if (command.owner && !this.bot.config.owners.includes(msg.author.id)) return;

    // Handles commands in DMs
    if (!command.allowdms && msg.channel instanceof PrivateChannel) {
      msg.createEmbed(string("global.ERROR"), string("global.ERROR_ALLOWDMS", { command: command.name }), "error");
      return;
    }

    // Handles guild options
    if (msg.channel.guild) {
      if (command.allowdisable !== false) {
        // Disabled categories
        if (guildconfig?.disabledCategories?.includes(command.category)) {
          return msg.createEmbed(string("global.ERROR"), string("global.ERROR_DISABLEDCATEGORY", { command: command.name }), "error");
        }

        // Disabled commands
        if (guildconfig?.disabledCmds?.includes(command.name)) {
          return msg.createEmbed(string("global.ERROR"), string("global.ERROR_DISABLED", { command: command.name }), "error");
        }
      }

      // Handles staff commands
      if (command.staff) {
        if (
          !msg.member?.permissions?.has("administrator") &&
          guildconfig?.staffRole &&
          !msg.member?.roles.includes(guildconfig.staffRole)
        ) {
          return msg.createEmbed(string("global.ERROR"), string("global.ERROR_STAFFCOMMAND", { command: command.name }), "error");
        }
      }

      // Handles NSFW commands
      if (command.nsfw && !msg.channel.nsfw) {
        return msg.createEmbed(string("global.ERROR"), string("global.ERROR_NSFW", { command: command.name }), "error");
      }

      // Handles voice-only commands
      if (command.voice) {
        const uservoice = msg.channel.guild.members?.get(msg.author.id)?.voiceState?.channelID;
        const botvoice = msg.channel.guild.members?.get(this.bot.user.id)?.voiceState?.channelID;

        // If the user isn't in a voice channel or if the user isn't in the same channel as the bot
        if (!uservoice || (botvoice && uservoice !== botvoice)) {
          return msg.createEmbed(string("global.ERROR"), string("global.ERROR_VOICE", { command: command.name }), "error");
        }

        // Checks to see if a member has specific roles
        const hasMusicRole = !guildconfig?.musicRole || msg.member?.roles?.includes(guildconfig.musicRole) || isStaff;

        // If the guild has musicRole set and the user doesn't have proper roles
        if (!hasMusicRole || (!hasMusicRole && !isStaff)) {
          return msg.createEmbed(string("global.ERROR"), string("global.ERROR_MUSICROLE"), "error");
        }

        // If the musicChannel is set
        if (guildconfig?.musicChannel && uservoice !== guildconfig?.musicChannel) {
          return msg.createEmbed(string("global.ERROR"), string("global.ERROR_MUSICCHANNEL"), "error");
        }

        // If onlyRQCC is set and the author isn't the same as the requester
        if (guildconfig?.onlyRequesterCanControl && this.bot.lavalink.manager.players?.get(msg.channel.guild.id)) {
          const requester = this.bot.lavalink.manager.players.get(msg.channel.guild.id)?.queue?.current?.requester as User;

          if ((!isStaff || !hasMusicRole) && requester.id !== msg.author.id) {
            return msg.createEmbed(msg.string("global.ERROR"), msg.string("global.ERROR_MUSICREQUESTER"));
          }
        }
      }

      // Handles agree channel commands
      if (command.name !== "agree") {
        if (guildconfig?.agreeChannel === msg.channel.id && guildconfig?.agreeBlockCommands !== false && !isStaff) {
          await msg.delete().catch(() => {});
          return;
        }
      }

      const dmChannel = await msg.author.getDMChannel();
      const botPerms = msg.channel.guild.members.get(this.bot.user.id)?.permissions;

      // Sends if the bot can't send messages in a channel or guild
      if (!msg.channel.permissionsOf(this.bot.user.id).has("sendMessages") || !botPerms?.has("sendMessages")) {
        return dmChannel.createMessage(string("global.ERROR_SENDPERMS", { channel: `<#${msg.channel.id}>` })).catch(() => {});
      }

      // Sends if the bot can't embed messages in a channel or guild
      if (!msg.channel.permissionsOf(this.bot.user.id).has("embedLinks") || !botPerms.has("embedLinks")) {
        return dmChannel.createMessage(string("global.ERROR_EMBEDPERMS", { channel: `<#${msg.channel.id}>` })).catch(() => {});
      }

      // Handles clientPerms
      if (command.clientperms?.length) {
        const missingPerms: string[] = [];

        command.clientperms.forEach((perm: any) => {
          if (!botPerms.has(perm)) missingPerms.push(perm);
        });

        // Sends any missingperms
        if (missingPerms.length) {
          return msg.createEmbed(
            string("global.ERROR"),
            string("global.ERROR_CLIENTPERMS", { perms: missingPerms.map((mperm) => `\`${mperm}\``).join(",") }),
            "error",
          );
        }
      }

      // Handles commands with requiredPerms
      if (command.requiredperms?.length && !guildconfig?.staffRole) {
        const missingPerms: string[] = [];
        command.requiredperms.forEach((perm: any) => {
          if (!msg.member?.permissions?.has(perm)) missingPerms.push(perm);
        });

        // Sends any missingperms
        if (missingPerms.length) {
          return msg.createEmbed(
            string("global.ERROR"),
            string("global.ERROR_REQUIREDPERMS", { perms: missingPerms.map((mperm) => `\`${mperm}\``).join(",") }),
            "error",
          );
        }
      }
    }

    // Handles command cooldowns
    if (command.cooldown && !this.bot.config.owners.includes(msg.author.id)) {
      const cooldown = this.bot.cooldowns.get(command.name + msg.author.id);
      if (cooldown) return msg.addReaction("⌛");
      this.bot.cooldowns.set(command.name + msg.author.id, new Date());
      setTimeout(() => {
        this.bot.cooldowns.delete(command.name + msg.author.id);
      }, command.cooldown);
    }

    // Handles command arguments
    let parsedArgs: ParsedArgs[];
    if (command.args) {
      // Parses arguments and sends if missing any
      parsedArgs = await this.bot.args.parse(command.args, args.join(" "), msg);
      const missingargs = parsedArgs.filter((a) => {
        return typeof a.value == "undefined" && !a.optional;
      });

      if (missingargs.length) {
        return msg.createEmbed(
          string("global.ERROR"),
          string("global.ERROR_MISSINGARGS", { arg: `${missingargs.map((a) => a.name).join(` ${string("global.OR")} `)}` }),
          "error",
        );
      }
    }

    // Logs when a command is ran
    this.bot.log.info(`${msg.tagUser(msg.author)} ran ${command.name} in ${msg.channel.guild?.name}${args.length ? `: ${args}` : ""}`);
    this.bot.logs.push({
      cmdName: command.name,
      authorID: msg.author.id,
      guildID: msg.channel.guild ? msg.channel.guild.id : msg.author.id,
      args: args,
      date: msg.timestamp,
    });

    try {
      // Runs the command & emits typing if it isn't silent
      if (command.silent !== true) await msg.channel.sendTyping();
      await command.run(msg, parsedArgs, args);
    } catch (err) {
      // Captures exceptions with Sentry
      Sentry.configureScope((scope) => {
        scope.setUser({ id: msg.author.id, username: msg.tagUser(msg.author) });
        scope.setExtra("guild", msg.channel.guild?.name);
        scope.setExtra("guildID", msg.channel.guild?.id);
      });

      // Logs the error
      Sentry.captureException(err);
      console.error(err);
      return msg.createEmbed(string("global.ERROR"), string("global.ERROR_OUTPUT", { error: err }), "error");
    }
  }
}
