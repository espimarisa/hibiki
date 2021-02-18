import type { Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { generateSnowflake } from "../../utils/snowflake";

export class AddpointCommand extends Command {
  description = "Gives a member a reputation point.";
  requiredperms = ["manageMessages"];
  args = "<member:member&strict> [reason:string]";
  aliases = ["addmerit", "addrep", "addreputation", "merit"];
  staff = true;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[], args: string[]) {
    const id = generateSnowflake();
    const member = pargs[0].value as Member;
    let reason = args.slice(1).join(" ");
    if (reason.length > 512) reason = reason.slice(0, 512);

    // Inserts the point
    await this.bot.db.insertUserPoint({
      id: id,
      receiver: member.id,
      giver: msg.author.id,
      guild: msg.channel.guild.id,
      reason: reason || null,
    });

    // Emits the event
    this.bot.emit("reputationPointAdd", msg.channel.guild, member.user, msg.author, reason, id);

    // Sends the embed
    msg.createEmbed(`✨ ${msg.string("moderation.POINT")}`, msg.string("moderation.POINT_ADDED", { member: member.user.username }));
  }
}
