/**
 * @file Handler
 * @description Handles and executes commands and events
 */

import { Message, GuildChannel, PrivateChannel } from "eris";
import { HibikiClient } from "./Client";
import { LocaleString } from "./Command";
import config from "../../config.json";

export class CommandHandler {
  bot: HibikiClient;

  /**
   * Command handler class
   * @param {HibikiClient} bot Main bot object
   * @listens messageCreate Listens for new messages
   * @example new CommandHandler(this.bot);
   */

  constructor(bot: HibikiClient) {
    this.bot = bot;
    this.bot.on("messageCreate", (msg) => this.onMessage(msg));
  }

  /**
   * Attempts to handle commands when a new message is sent
   * @param {Message} msg Main message object
   */

  async onMessage(msg: Message): Promise<unknown> {
    if (!msg || !msg.content || msg.author.bot === true || !msg.channel || !msg.author) return;

    // Finds the locale to use
    const userLocale = await this.bot.localeSystem.getUserLocale(msg.author.id, this.bot);
    const str = this.bot.localeSystem.getLocaleFunction(userLocale) as LocaleString;

    if (msg.channel instanceof PrivateChannel && config.logchannel !== "") {
      // Logs any DMs sent
      this.bot.createMessage(config.logchannel, {
        embed: {
          description: `${msg.content}`,
          color: this.bot.convertHex("general"),
          author: {
            icon_url: msg.author.dynamicAvatarURL(),
            name: `Messaged by ${this.bot.tagUser(msg.author)}`,
          },
          image: {
            url: msg.attachments.length !== 0 ? msg.attachments[0].url : "",
          },
        },
      });
    }

    // Gets the channel and prefix
    const prefix = config.prefix;
    const extendedChannel = msg.channel as GuildChannel;

    // TODO: Add a better prefix parser, like we have in v3.2.9 (prod).
    if (!msg.content.startsWith(prefix)) return;

    // Finds the command to run
    const [commandName, ...args] = msg.content.trim().slice(prefix.length).split(/ +/g);
    if (!commandName) return;
    const command = this.bot.commands.find((cmd) => cmd.name === commandName || cmd.aliases?.includes(commandName));
    if (!command) return;

    // Handles owner commands
    if (command.owner && !config.owners.includes(msg.author.id)) return;

    // Handles command cooldowns
    if (command.cooldown && !config.owners.includes(msg.author.id)) {
      const cooldown = this.bot.cooldowns.get(command.name + msg.author.id);
      if (cooldown) return msg.addReaction("⌛");
      this.bot.cooldowns.set(command.name + msg.author.id, new Date());
      setTimeout(() => {
        this.bot.cooldowns.delete(command.name + msg.author.id);
      }, command.cooldown);
    }

    // Handles NSFW commands
    if (command.nsfw === true && extendedChannel.nsfw === false) {
      return this.bot.createEmbed("❌ Error", "This command can only be ran in a NSFW channel.", msg, "error");
    }

    // Handles DMs & commands in DMs
    if (command.allowdms === false && msg.channel.type === 1) {
      return this.bot.createEmbed("❌ Error", "This command can only be ran in a server.", msg, "error");
    }

    // TODO: Make a enum for permissions and stop using eris-additions

    // Handles command arguments
    let parsedArgs;

    if (command.args) {
      // Parses arguments
      parsedArgs = this.bot.args.parse(command.args, args.join(" "), msg);

      // Handles and sends missing arguments
      const missingargs = parsedArgs.filter((a: Record<string, unknown>) => typeof a.value == "undefined" && !a.optional);

      if (missingargs.length) {
        return this.bot.createEmbed("❌ Error", "uhhhh ohhh idkk what happennn mens :c", msg, "error");
      }
    }

    // Runs the command
    command.run(msg, str, this.bot, args, parsedArgs);
  }
}
