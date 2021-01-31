import type { Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class GaylevelCommand extends Command {
  description = "Calculates how gay you or another member is.";
  args = "[member:member&fallback]";
  aliases = ["gay", "gayness"];

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[]) {
    const member = pargs[0].value as Member;
    const usercfg = await this.bot.db.getUserConfig(member.id);
    const gayLevel = usercfg?.gayLevel || Math.round(Math.random() * 100);

    // TODO: allow people to set gaylevel in configuser
    msg.createEmbed(
      `🏳️‍🌈 ${msg.string("fun.GAYLEVEL")}`,
      msg.string("fun.GAYLEVEL_LEVEL", { member: member.user.username, level: gayLevel }),
    );
  }
}
