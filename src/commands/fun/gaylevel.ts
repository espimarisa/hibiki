import type { Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class GaylevelCommand extends Command {
  description = "Calculates how gay you or another member is.";
  args = "[member:member&fallback]";
  aliases = ["gay", "gayness"];

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[]) {
    const member = pargs[0].value as Member;
    const random = Math.floor(Math.random() * 99) + 1;

    // TODO: allow people to set gaylevel in configuser
    msg.createEmbed(`🏳️‍🌈 ${msg.string("fun.GAYLEVEL")}`, msg.string("fun.GAYLEVEL_LEVEL", { member: member.user.username, level: random }));
  }
}
