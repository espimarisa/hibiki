/**
 * @file Handler
 * @description Handles and executes commands and events
 * @author Espi <contact@espi.me>
 */

import { Message, GuildChannel, PrivateChannel } from "eris";
import { hibikiClient } from "./Client";
import config from "../../config.json";

export class CommandHandler {
  bot: hibikiClient;

  /**
   * Command handler class
   * @param {hibikiClient} bot Main bot object
   * @listens messageCreate Listens for new messages
   * @example new CommandHandler(this.bot);
   */

  constructor(bot: hibikiClient) {
    this.bot = bot;
    this.bot.on("messageCreate", (msg) => this.onMessage(msg));
  }

  /**
   * Attempts to handle commands when a new message is sent
   * @param {Message} msg Main message object
   */

  async onMessage(msg: Message): Promise<unknown> {
    if (!msg || !msg.content || msg.author.bot === true || !msg.channel || !msg.author) return;

    // Logs any DMs sent
    if (msg.channel instanceof PrivateChannel && config.logchannel !== "") {
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
    const commandName = msg.content.toLowerCase().split(" ").shift()?.replace(`${prefix}`, "").trim();
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

    // Runs the command
    command.run(msg, this.bot);
  }
}
