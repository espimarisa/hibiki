import type { Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class WarningsCommand extends Command {
  description = "Shows what warnings you (or another member) has.";
  args = "<member:member&fallback>";
  aliases = ["search", "punishments", "strikes", "warns", "warnings"];

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[]) {
    const member = pargs[0].value as Member;
    const warnings = await this.bot.db.getAllUserGuildWarnings(member.id, msg.channel.guild.id);

    // If the member has no warnings
    if (!warnings.length) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.WARNINGS_HASNONE", { member: member.username }), "error");
    }

    // If more than 20 points
    // TODO: Pagify and implement this
    if (warnings.length > 20) {
      return msg.createEmbed("not implemented yet");
    }

    // Sends points
    msg.channel.createMessage({
      embed: {
        title: `🔨 ${msg.string("moderation.WARNINGS_TOTAL", { member: member.user.username, total: warnings.length })}`,
        color: msg.convertHex("general"),
        fields: warnings.map((w) => ({
          name: `${msg.string("moderation.WARNING_DESCRIPTION", {
            id: w.id,
            giver: msg.channel.guild.members.get?.(w.giver)?.user ? msg.channel.guild.members.get(w.giver)?.user.username : w.giver,
          })}`,
          value: `${w.reason?.slice(0, 150) || msg.string("global.NO_REASON")}`,
        })),
        footer: {
          text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
