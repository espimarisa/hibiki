/**
 * @file Handler
 * @description Handles and executes commands
 */

import { Message, TextChannel, PrivateChannel } from "eris";
import { HibikiClient } from "../classes/Client";
import { LocaleString, ParsedArgs } from "../classes/Command";
import { Event } from "../classes/Event";
import config from "../../config.json";

export class HandlerEvent extends Event {
  events = ["messageCreate"];

  async run(msg: Message<TextChannel>, bot: HibikiClient): Promise<void> {
    if (!msg || !msg.content || msg.author.bot === true || !msg.channel || !msg.author) return;
    let prefix;

    // Finds the locale and what prefix to use
    const userLocale = await bot.localeSystem.getUserLocale(msg.author.id, bot);
    const str = bot.localeSystem.getLocaleFunction(userLocale) as LocaleString;
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
    if (!commandName) return;
    const command = bot.commands.find((cmd) => cmd.name === commandName || cmd.aliases?.includes(commandName));
    if (!command) return;

    // Handles owner commands
    if (command.owner && !config.owners.includes(msg.author.id)) return;

    // Handles command cooldowns
    if (command.cooldown && !config.owners.includes(msg.author.id)) {
      const cooldown = bot.cooldowns.get(command.name + msg.author.id);
      if (cooldown) return msg.addReaction("⌛");
      bot.cooldowns.set(command.name + msg.author.id, new Date());
      setTimeout(() => {
        bot.cooldowns.delete(command.name + msg.author.id);
      }, command.cooldown);
    }

    // Handles NSFW commands
    if (command.nsfw === true && msg.channel.nsfw === false) {
      bot.createEmbed("❌ Error", "This command can only be ran in a NSFW channel.", msg, "error");
      return;
    }

    // Handles DMs & commands in DMs
    if (command.allowdms === false && msg.channel instanceof PrivateChannel) {
      bot.createEmbed("❌ Error", "This command can only be ran in a server.", msg, "error");
      return;
    }

    // TODO: Make a enum for permissions and stop using eris-additions

    // Handles command arguments
    let parsedArgs;

    if (command.args) {
      // Parses arguments
      parsedArgs = bot.args.parse(command.args, args.join(" "), msg);

      // Handles and sends missing arguments
      const missingargs = parsedArgs.filter((a: Record<string, unknown>) => typeof a.value == "undefined" && !a.optional);

      if (missingargs.length) {
        bot.createEmbed("❌ Error", `You didn't provide a **${missingargs.map((a: ParsedArgs) => a.name).join(" or ")}**.`, msg, "error");
        return;
      }
    }

    // Runs the command
    command.run(msg, str, bot, args, parsedArgs);
  }
}

export default new HandlerEvent();
