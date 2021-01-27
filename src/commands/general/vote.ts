import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class VoteCommand extends Command {
  description = "Gives a link to vote on top.gg.";
  allowdms = true;
  requiredkeys = ["topgg"];

  async run(msg: Message<TextChannel>) {
    msg.createEmbed(
      `🗳 ${msg.string("general.VOTE")}`,
      msg.string("general.VOTE_INFO", {
        username: `${this.bot.user.username}`,
        link: `https://top.gg/bot/${this.bot.user.id}/vote`,
      }),
    );
  }
}
