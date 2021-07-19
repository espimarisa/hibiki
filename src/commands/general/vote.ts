/**
 * @file Vote command
 * @description Gives a link to vote on top.gg
 */

import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class VoteCommand extends Command {
  description = "Gives a link to vote on top.gg.";
  requiredkeys = ["topgg"];
  allowdms = true;

  async run(msg: Message<TextChannel>) {
    msg.createEmbed(
      `🗳 ${msg.locale("general.VOTE")}`,
      msg.locale("general.VOTE_INFO", {
        username: `${this.bot.user.username}`,
        link: `https://top.gg/bot/${this.bot.user.id}/vote`,
      }),
    );
  }
}
