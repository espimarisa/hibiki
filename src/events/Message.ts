/**
 * @file Message
 * @description Handles legacy message-based commands
 * @module HibikiMessageEvent
 */

import type { Message } from "discord.js";
import { HibikiEvent } from "../classes/Event.js";
import { logger } from "../utils/logger.js";

export class HibikiMessageEvent extends HibikiEvent {
  events: HibikiEventEmitter[] = ["messageCreate"];
  requiredIntents?: ResolvableIntentString[] = ["GUILD_MESSAGES"];

  public async run(_event: HibikiEventEmitter, msg: Message) {
    if (!msg?.content || !msg.author || msg.author.bot || !msg.channel || msg.channel.type === "DM") return;

    // Checks to see if the prefix was a mention
    const mentionRegex = new RegExp(`<@!?${this.bot.user?.id}> ?`);
    const mentionPrefix = mentionRegex.exec(msg.content);

    // Gets configured prefixes
    const configPrefixes = this.bot.config.hibiki.prefixes;
    let prefix = "";

    // Sets the prefix to a mention if it was one
    if (mentionPrefix?.index === 0) prefix = mentionPrefix?.[0];

    // Looks for a legacy prefix if need be
    if (configPrefixes?.length) {
      const prefixes = configPrefixes.map((p) => msg.content.toLowerCase().startsWith(p)).indexOf(true);
      prefix = configPrefixes[prefixes];
    }

    // Don't try to do anything if no prefixes are used
    if (!prefix || prefix?.length === 0) return;

    // Searches for the command to run; only index messageOnly commands
    const [commandName, ...args] = msg.content.trim().slice(prefix.length).split(/\s+/g);
    const command = this.bot.commands.find((cmd) => cmd?.name === commandName.toLowerCase() && cmd.messageOnly);

    // Returns if no command was found
    if (!command) return;

    // If the command isn't a message only, return
    if (typeof command.runWithMessage !== "function") return;

    // Check if the user is in the blacklist
    const blacklisted = await this.bot.db.getBlacklistItem(msg.author.id, "USER");
    if (blacklisted) {
      return;
    }

    // Finds what locale to use and sets msg.getString
    let locale = this.bot.config.hibiki.locale;
    const guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild ? msg.channel.guild.id : "");
    const userLocale = await this.bot.localeSystem.getUserLocale(msg.author.id, this.bot);
    if (userLocale) locale = userLocale;
    else if (guildconfig?.locale && !userLocale) locale = guildconfig.locale;
    const string = this.bot.localeSystem.getLocaleFunction(locale);
    msg.getString = string;

    // Handles owner commands
    if (command.ownerOnly) {
      if (!this.bot.application?.owner?.id) await this.bot.application?.fetch();

      // TODO: Type this
      const applicationOwnerData = this.bot.application?.owner?.toJSON() as any;
      if (!applicationOwnerData.members?.includes(msg.author.id) && applicationOwnerData.id !== msg.author.id) return;
    }

    // Logs when a command is run
    logger.info(`${msg.author.tag}-${msg.author.id} ran ${command.name} in ${msg.guild?.name}-${msg.guild?.id} with the arguments ${args}`);

    // Check for command cooldowns
    if (command.cooldown) {
      // Looks for the cooldown
      const cooldown = this.bot.cooldowns.get(command.name + msg.author.id);

      if (cooldown) {
        await msg.channel.send({
          embeds: [
            {
              title: msg.getString("global.ERROR"),
              description: msg.getString("global.COMMAND_COOLDOWN", {
                command: command.name,
                time: Math.ceil((cooldown.getTime() - Date.now()) / 1000),
              }),
              color: this.bot.config.colours.error,
            },
          ],
        });

        return;
      }

      // Sets the cooldown
      this.bot.cooldowns.set(command.name + msg.author.id, new Date());
      setTimeout(() => this.bot.cooldowns.delete(command.name + msg.author.id), command.cooldown);
    }

    // Tries to run the command
    try {
      await msg.channel.sendTyping();
      await command.runWithMessage(msg, args);
    } catch (error) {
      await msg.reply((error as Error).message);
      throw new Error(error as string);
    }
  }
}
