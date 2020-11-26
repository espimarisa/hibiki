/**
 * @fileoverview Hibiki command handler
 * @description Handles and executes commands and their paramaters
 * @author Espi <contact@espi.me>
 */

import { Message, GuildChannel } from "eris";
import { hibikiClient } from "./Client";
import config from "../../config.json";

export class Handler {
  bot: hibikiClient;

  constructor(bot: hibikiClient) {
    this.bot = bot;
    this.bot.on("messageCreate", (msg) => this.onMessage(msg));
  }

  async onMessage(msg: Message): Promise<unknown> {
    if (!msg || !msg.content || msg.author.bot === true || !msg.channel) return;

    // Gets the channel and prefix
    const prefix = config.prefix;
    const extendedChannel = msg.channel as GuildChannel;

    // TODO: Add a better prefix parser, like we have in v3.2.9 (prod).
    if (!msg.content.startsWith(prefix)) return;

    // Finds the command to run
    // this is shit and needs to be updated to match the old handler
    // so we can have multiple prefixes (and support @bot)

    const commandName = msg.content.toLowerCase().split(" ").shift()?.replace(`${prefix}`, "").trim();
    if (!commandName) return;
    const command = this.bot.commands.find((cmd) => cmd.name === commandName || cmd.aliases?.includes(commandName));
    if (!command) return;

    // Handles owner commands
    if (command.owner && !config.owners.includes(msg.author.id)) return;

    // TODO: Implement cooldowns

    // Handles NSFW commands
    if (command.nsfw === true && extendedChannel.nsfw === false) {
      return msg.channel.createMessage("This command can only be run in a NSFW channel.");
    }

    // Handles DM commands
    if (command.allowdms === false && msg.channel.type === 1) {
      return msg.channel.createMessage("You can't use this command in DMs. Try again in a server.");
    }

    // TODO: Make a enum for permissions and stop using eris-additions

    command.run(msg, this.bot);
  }
}
