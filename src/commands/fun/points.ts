import type { Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
// import { pagify } from "../../utils/pagify";

export class PointsCommand extends Command {
  description = "Shows what reputation points you (or another member) has.";
  args = "<member:member&fallback>";
  aliases = ["merits", "rep", "reps", "reputation"];

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[]) {
    const member = pargs[0].value as Member;
    const points = await this.bot.db.getAllUserGuildPoints(member.id, msg.channel.guild.id);

    // If the member has no points
    if (!points.length) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("fun.POINTS_HASNONE", { member: member.username }), "error");
    }

    // If more than 20 points
    // TODO: Pagify and implement this
    // if (points.length > 20) {
    //   const omsg = await msg.createEmbed("pagify");
    //   const pages: { fields: { name: string; value: string }[] }[] = [];

    //   points.forEach((point) => {
    //     if (!pages[pages.length] || pages[pages.length].fields.length > 15) {
    //       pages.push({
    //         fields: [
    //           {
    //             name: `${point.id}`,
    //             value: `${point.reason.slice(0, 150) || msg.string("global.NO_REASON")}`,
    //           },
    //         ],
    //       });
    //     } else {
    //       pages[pages.length].fields.push({ name: point.id, value: point.reason });
    //     }
    //   });

    //   pagify(pages, omsg, this.bot, msg.author.id, { title: "idk", color: msg.convertHex("general") }, false);
    // }

    // Sends points
    msg.channel.createMessage({
      embed: {
        title: `✨ ${msg.string("fun.POINTS_TOTAL", { member: member.user.username, total: points.length })}`,
        color: msg.convertHex("general"),
        fields: points.map((p) => ({
          name: `${msg.string("fun.POINT_DESCRIPTION", {
            id: p.id,
            giver: msg.channel.guild.members.get?.(p.giver)?.user ? msg.channel.guild.members.get(p.giver)?.user.username : p.giver,
          })}`,
          value: `${p.reason?.slice(0, 150) || msg.string("global.NO_REASON")}`,
        })),
        footer: {
          text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
