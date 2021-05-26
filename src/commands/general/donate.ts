/**
 * @file Donate command
 * @description Tells executor how to donate to the bot project
 */

import type { Message, TextChannel } from "eris";

import { Command } from "../../classes/Command";

export class DonateCommand extends Command {
  description = "Tells you how to donate to the bot project.";
  allowdms = true;
  allowdisable = false;

  async run(msg: Message<TextChannel>) {
    msg.createEmbed(`💜 ${msg.string("general.DONATE")}`, msg.string("general.DONATE_DESCRIPTION"));
  }
}
