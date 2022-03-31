import type { Message } from "discord.js";
import { HibikiCommand } from "../../classes/Command";

export class SayCommand extends HibikiCommand {
  description = "Says something.";
  messageOnly = true;
  owner = true;

  public async runWithMessage(message: Message) {
    await message.channel.send(message.content);
  }
}
