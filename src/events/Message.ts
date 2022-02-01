import type { Message } from "discord.js";
import { HibikiEvent } from "../classes/Event";
import { logger } from "../utils/logger";

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

    // Finds what locale to use and sets msg.getString
    let locale = this.bot.config.hibiki.locale;
    const guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild ? msg.channel.guild.id : "");
    const userLocale = await this.bot.localeSystem.getUserLocale(msg.author.id, this.bot);
    if (userLocale) locale = userLocale;
    else if (guildconfig?.locale && !userLocale) locale = guildconfig.locale;
    const string = this.bot.localeSystem.getLocaleFunction(locale);
    msg.getString = string;

    // Handles owner commands
    if (command.owner) {
      if (!this.bot.application?.owner?.id) await this.bot.application?.fetch();

      // TODO: Type this
      const applicationOwnerData = this.bot.application?.owner?.toJSON() as any;
      if (!applicationOwnerData.members?.includes(msg.author.id) && applicationOwnerData.id !== msg.author.id) return;
    }

    // Logs when a command is run
    logger.info(`${msg.author.tag}-${msg.author.id} ran ${command.name} in ${msg.guild?.name}-${msg.guild?.id} with the arguments ${args}`);

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