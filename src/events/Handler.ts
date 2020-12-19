/**
 * @file Handler
 * @description Handles and executes commands
 */

import { Message, TextChannel, PrivateChannel } from "eris";
import { HibikiClient } from "../classes/Client";
import { LocaleString, ParsedArgs } from "../classes/Command";
import { Event } from "../classes/Event";
import config from "../../config.json";
import * as Sentry from "@sentry/node";

export class HandlerEvent extends Event {
  events = ["messageCreate"];

  async run(msg: Message<TextChannel>, bot: HibikiClient) {
    if (!msg || !msg.content || msg.author.bot || !msg.channel || !msg.author) return;
    let prefix;

    // Finds the locale and what prefix to use
    const userLocale = await bot.localeSystem.getUserLocale(msg.author.id, bot);
    const string = bot.localeSystem.getLocaleFunction(userLocale) as LocaleString;
    const prefixes = config.prefixes.map((p) => msg.content.toLowerCase().startsWith(p)).indexOf(true);
    const guildconfig = await bot.db.getGuildConfig(msg.channel.guild ? msg.channel.guild.id : "");

    // Checks for a valid prefix
    if (guildconfig && guildconfig.prefix && msg.content.toLowerCase().startsWith(guildconfig.prefix)) prefix = guildconfig.prefix;
    else if ((!guildconfig || !guildconfig.prefix) && config.prefixes && prefixes !== -1) prefix = config.prefixes[prefixes];
    else if (msg.content.startsWith(`<@!${bot.user.id}> `)) prefix = `<@!${bot.user.id}> `;
    else if (msg.content.startsWith(`<@${bot.user.id}> `)) prefix = `<@${bot.user.id}> `;
    else if (msg.content.startsWith(`<@${bot.user.id}>`)) prefix = `<@${bot.user.id}>`;
    else if (msg.content.startsWith(`<@!${bot.user.id}>`)) prefix = `<@!${bot.user.id}>`;
    if (!prefix) return;

    // Finds the command to run
    const [commandName, ...args] = msg.content.trim().slice(prefix.length).split(/ +/g);
    const command = bot.commands.find((cmd) => cmd?.name === commandName.toLowerCase() || cmd?.aliases.includes(commandName.toLowerCase()));
    if (!command) return;

    // Handles owner commands
    if (command.owner && !config.owners.includes(msg.author.id)) return;

    // Handles commands in DMs
    if (!command.allowdms && msg.channel instanceof PrivateChannel) {
      bot.createEmbed(string("global.ERROR"), string("global.ERROR_ALLOWDMS", { command: command.name }), msg, "error");
      return;
    }

    // Handles NSFW commands
    if (command.nsfw && !msg.channel.nsfw && msg.channel.guild) {
      bot.createEmbed(string("global.ERROR"), string("global.ERROR_NSFW", { command: command.name }), msg, "error");
      return;
    }

    // Handles clientPerms, botPerms, requiredPerms, and staff commands
    if (msg.channel.guild) {
      const dmChannel = await msg.author.getDMChannel();
      const botPerms = msg.channel.guild.members.get(bot.user.id)?.permissions;

      // Sends if the bot can't send messages in a channel or guild
      if (!msg.channel.permissionsOf(bot.user.id).has("sendMessages") || !botPerms?.has("sendMessages")) {
        return dmChannel.createMessage(string("global.ERROR_SENDPERMS", { channel: `<#${msg.channel.id}>` }));
      }

      // Sends if the bot can't embed messages in a channel or guild
      if (!msg.channel.permissionsOf(bot.user.id).has("embedLinks") || !botPerms.has("embedLinks")) {
        return dmChannel.createMessage(string("global.ERROR_EMBEDPERMS", { channel: `<#${msg.channel.id}>` }));
      }

      // Handles clientPerms
      if (command.clientperms) {
        // One clientperm
        if (typeof command.clientperms == "string" && !botPerms.has(command.clientperms)) {
          return bot.createEmbed(string("global.ERROR"), string("global.ERROR_CLIENTPERMS", { perms: command.clientperms }), msg, "error");
        }

        // Array of clientperms
        else if (Array.isArray(command.clientperms)) {
          const missingPerms: string[] = [];
          command.clientperms.forEach((perm) => {
            if (!botPerms.has(perm)) missingPerms.push(perm);
          });

          // Sends any missingperms
          if (missingPerms.length) {
            return bot.createEmbed(
              string("global.ERROR"),
              string("global.ERROR_CLIENTPERMS", { perms: missingPerms.map((mperm) => `\`${mperm}\``).join(",") }),
              msg,
              "error",
            );
          }
        }
      }

      // Handles staff commands
      if (command.staff) {
        if (!msg.member?.permissions.has("administrator") && guildconfig?.staffRole && !msg.member?.roles.includes(guildconfig.staffRole)) {
          return bot.createEmbed(string("global.ERROR"), string("global.ERROR_STAFFCOMMAND"), msg, "error");
        }
      }

      // Handles commands with requiredPerms
      if (command.requiredperms && !guildconfig?.staffRole) {
        // One requiredperms
        if (typeof command.requiredperms == "string") {
          if (!msg.member?.permissions.has(command.requiredperms)) {
            return bot.createEmbed(
              string("global.ERROR"),
              string("global.ERROR_REQUIREDPERMS", { perms: command.requiredperms }),
              msg,
              "error",
            );
          }
        }

        // Array of clientperms
        else if (Array.isArray(command.requiredperms)) {
          const missingPerms: any[] = [];
          command.requiredperms.forEach((perm) => {
            if (!msg.member?.permissions.has(perm)) missingPerms.push(perm);
          });

          // Sends any missingperms
          if (missingPerms.length) {
            return bot.createEmbed(
              string("global.ERROR"),
              string("global.ERROR_REQUIREDPERMS", { perms: missingPerms.map((mperm) => `\`${mperm}\``).join(",") }),
              msg,
              "error",
            );
          }
        }
      }
    }

    // Handles command cooldowns
    if (command.cooldown && !config.owners.includes(msg.author.id)) {
      const cooldown = bot.cooldowns.get(command.name + msg.author.id);
      if (cooldown) return msg.addReaction("⌛");
      bot.cooldowns.set(command.name + msg.author.id, new Date());
      setTimeout(() => {
        bot.cooldowns.delete(command.name + msg.author.id);
      }, command.cooldown);
    }

    // Handles command arguments
    let parsedArgs;
    if (command.args) {
      // Parses arguments and sends if missing any
      parsedArgs = bot.args.parse(command.args, args.join(" "), msg);
      const missingargs = parsedArgs.filter((a: Record<string, unknown>) => typeof a.value == "undefined" && !a.optional);

      if (missingargs.length) {
        return bot.createEmbed(
          string("global.ERROR"),
          string("global.ERROR_MISSINGARGS", { arg: `${missingargs.map((a: ParsedArgs) => a.name).join(` ${string("global.OR")} `)}.` }),
          msg,
          "error",
        );
      }
    }

    // Logs when a command is ran
    bot.log.info(`${bot.tagUser(msg.author)} ran ${command.name} in ${msg.channel.guild?.name}${args.length ? `: ${args}` : ""}`);

    try {
      // Tries to run a command and catches any errors
      await command.run(msg, bot, string, parsedArgs);
    } catch (err) {
      Sentry.configureScope((scope) => {
        scope.setUser({ id: msg.author.id, username: bot.tagUser(msg.author) });
        scope.setExtra("guild", msg.channel.guild?.name);
        scope.setExtra("guildID", msg.channel.guild?.id);
      });

      Sentry.captureException(err);
      console.error(err);
      return bot.createEmbed(string("global.ERROR"), string("global.ERROR_OUTPUT", { error: err }), msg, "error");
    }
  }
}

export default new HandlerEvent();
