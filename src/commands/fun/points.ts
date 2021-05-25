/**
 * @file Points command
 * @description Shows what reputation points executor or provided member has
 */

import type { EmbedOptions, Member, Message, TextChannel } from "eris";

import { Command } from "../../classes/Command";
import { pagify } from "../../utils/pagify";

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
    if (points.length > 20) {
      const pages: EmbedOptions[] = [];

      points.forEach((p) => {
        // Makes pages out of points
        if (!pages[pages.length - 1] || pages[pages.length - 1].fields.length > 10) {
          pages.push({
            title: `✨ ${msg.string("fun.POINTS_TOTAL", { member: member.user.username, total: points.length })}`,
            color: msg.convertHex("general"),
            fields: [
              {
                name: `${msg.string("fun.POINT_DESCRIPTION", {
                  id: p.id,
                  giver: msg.channel.guild.members.get?.(p.giver)?.user ? msg.channel.guild.members.get(p.giver)?.user.username : p.giver,
                })}`,
                value: `${p.reason?.slice(0, 150) || msg.string("global.NO_REASON")}`,
              },
            ],
          });
        } else {
          // Adds to already existing pages
          pages[pages.length - 1].fields.push({
            name: `${msg.string("fun.POINT_DESCRIPTION", {
              id: p.id,
              giver: msg.channel.guild.members.get?.(p.giver)?.user ? msg.channel.guild.members.get(p.giver)?.user.username : p.giver,
            })}`,
            value: `${p.reason?.slice(0, 150) || msg.string("global.NO_REASON")}`,
          });
        }
      });

      // Pagifies points
      return pagify(
        pages,
        msg.channel,
        this.bot,
        msg.author.id,
        { title: msg.string("global.EXITED"), color: msg.convertHex("error") },
        false,
        msg.string("global.RAN_BY", { author: msg.tagUser(msg.author), extra: "%c/%a" }),
        msg.author.dynamicAvatarURL(),
      );
    }

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
