import type { EmbedOptions, Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { pagify } from "../../utils/pagify";

export class WarnsCommand extends Command {
  description = "Shows what warnings you (or another member) has.";
  args = "<member:member&fallback>";
  aliases = ["search", "punishments", "strikes", "warns", "warnings"];

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[]) {
    const member = pargs[0].value as Member;
    const warnings = await this.bot.db.getAllUserGuildWarnings(member.id, msg.channel.guild.id);

    // If the member has no warnings
    if (!warnings.length) {
      return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("moderation.WARNINGS_HASNONE", { member: member.username }), "error");
    }

    // If more than 20 warnings
    if (warnings.length > 20) {
      const pages: EmbedOptions[] = [];
      warnings.forEach((w) => {
        // Makes pages out of warning
        if (!pages[pages.length - 1] || pages[pages.length - 1].fields.length > 10) {
          pages.push({
            title: `🔨 ${msg.locale("moderation.WARNINGS_TOTAL", { member: member.user.username, total: warnings.length })}`,
            color: msg.convertHex("general"),
            fields: [
              {
                name: `${msg.locale("moderation.WARNING_DESCRIPTION", {
                  id: w.id,
                  giver: msg.channel.guild.members.get?.(w.giver)?.user ? msg.channel.guild.members.get(w.giver)?.user.username : w.giver,
                })}`,
                value: `${w.reason?.slice(0, 150) || msg.locale("global.NO_REASON")}`,
              },
            ],
          });
        } else {
          // Adds to already existing pages
          pages[pages.length - 1].fields.push({
            name: `${msg.locale("moderation.WARNING_DESCRIPTION", {
              id: w.id,
              giver: msg.channel.guild.members.get?.(w.giver)?.user ? msg.channel.guild.members.get(w.giver)?.user.username : w.giver,
            })}`,
            value: `${w.reason?.slice(0, 150) || msg.locale("global.NO_REASON")}`,
          });
        }
      });

      // Pagifies points
      return pagify(
        pages,
        msg.channel,
        this.bot,
        msg.author.id,
        { title: msg.locale("global.EXITED"), color: msg.convertHex("error") },
        false,
        msg.locale("global.RAN_BY", { author: msg.tagUser(msg.author), extra: "%c/%a" }),
        msg.author.dynamicAvatarURL(),
      );
    }

    // Sends points
    msg.channel.createMessage({
      embed: {
        title: `🔨 ${msg.locale("moderation.WARNINGS_TOTAL", { member: member.user.username, total: warnings.length })}`,
        color: msg.convertHex("general"),
        fields: warnings.map((w) => ({
          name: `${msg.locale("moderation.WARNING_DESCRIPTION", {
            id: w.id,
            giver: msg.channel.guild.members.get?.(w.giver)?.user ? msg.channel.guild.members.get(w.giver)?.user.username : w.giver,
          })}`,
          value: `${w.reason?.slice(0, 150) || msg.locale("global.NO_REASON")}`,
        })),
        footer: {
          text: msg.locale("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
