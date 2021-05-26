/**
 * @file CoolLevel command
 * @description Calculates how cool executor or another member is
 */

import type { Member, Message, TextChannel } from "eris";

import { Command } from "../../classes/Command";

export class CoollevelCommand extends Command {
  description = "Calculates how cool you or another member is.";
  args = "[member:member&fallback]";
  aliases = ["cool", "coolness"];

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[]) {
    const member = pargs[0].value as Member;
    const random = Math.floor(Math.random() * 99) + 1;

    msg.createEmbed(
      `😎 ${msg.string("fun.COOLLEVEL")}`,
      msg.string("fun.COOLLEVEL_LEVEL", { member: member.user.username, level: random }),
    );
  }
}
