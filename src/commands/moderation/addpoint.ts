import type { EmbedField, Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { generateSnowflake } from "../../utils/snowflake";

export class AddPointCommand extends Command {
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
    const points = await this.bot.db.getAllUserGuildPoints(member.id, msg.channel.guild.id);
    const fields: EmbedField[] = [];

    // ID
    fields.push({
      name: msg.locale("global.ID"),
      value: `${id}`,
      inline: true,
    });

    // Total if over 1
    if (points.length > 1) {
      fields.push({
        name: msg.locale("moderation.POINT_TOTAL"),
        value: `${points.length}`,
        inline: true,
      });
    }

    // Reason
    if (reason) {
      fields.push({
        name: msg.locale("global.REASON"),
        value: `${reason}`,
      });
    }

    // Sends point success
    msg.channel.createMessage({
      embed: {
        title: msg.locale("global.SUCCESS"),
        description: msg.locale("moderation.POINT_ADDED", { member: member.user.username }),
        color: msg.convertHex("success"),
        fields: fields,
        footer: {
          text: msg.locale("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
