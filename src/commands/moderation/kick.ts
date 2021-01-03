import type { Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { askYesNo } from "../../utils/ask";
import { roleHierarchy } from "../../utils/hierarchy";

export class KickCommand extends Command {
  description = "Kicks a member from the server.";
  clientperms = ["kickMembers"];
  requiredperms = ["kickMembers"];
  args = "<member:member&strict> [reason:string]";
  aliases = ["getout", "k"];
  staff = true;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs, args: string[]) {
    // Gets the member and reason
    const member = pargs[0].value as Member;
    let reason = args.slice(1).join(" ");
    if (!reason.length) reason = msg.string("global.NO_REASON");
    else if (reason.length > 512) reason = reason.slice(0, 512);

    // Compares bot roles to target's roles
    if (!roleHierarchy(msg.channel.guild.members.get(this.bot.user.id), member)) {
      return msg.createEmbed(
        msg.string("global.ERROR"),
        msg.string("moderation.KICK_TOOLOWROLE", { member: msg.tagUser(member.user) }),
        "error",
      );
    }

    // Compares author roles to target
    if (roleHierarchy(msg.member, member)) {
      const kickmsg = await msg.createEmbed(
        `🔨 ${msg.string("moderation.KICK")}`,
        msg.string("moderation.KICK_CONFIRMATION", { member: msg.tagUser(member.user) }),
      );

      // Waits for response
      const { response } = await askYesNo(this.bot, msg).catch(() => {
        return kickmsg.editEmbed(msg.string("global.ERROR"), msg.string("global.TIMEOUT_REACHED"), "error");
      });

      if (typeof response != "boolean") return;

      // If the kick was cancelled
      if (response === false)
        return kickmsg.editEmbed(
          msg.string("global.CANCELLED"),
          msg.string("moderation.KICK_CANCELLED", { member: msg.tagUser(member.user) }),
          "error",
        );

      try {
        await member.kick(`${reason} (by ${msg.tagUser(msg.author, true)})`);
      } catch (err) {
        await kickmsg.editEmbed(
          `🔨 ${msg.string("moderation.KICK")}`,
          msg.string("moderation.KICK_FAILED", { member: msg.tagUser(member.user) }),
          "error",
        );
      }

      // Gets the kicked member's locale and DMs them on kick
      const victimLocale = await this.bot.localeSystem.getUserLocale(member.id, this.bot);
      const dmchannel = await member.user.getDMChannel();
      if (dmchannel) {
        dmchannel.createMessage({
          embed: {
            title: this.bot.localeSystem.getLocale(`${victimLocale}`, "moderation.KICKED_FROM", {
              guild: msg.channel.guild.name,
            }),
            description: this.bot.localeSystem.getLocale(`${victimLocale}`, "moderation.KICKED_FOR", {
              reason: reason,
            }),
            color: msg.convertHex("error"),
          },
        });

        await kickmsg.editEmbed(
          `🔨 ${msg.string("moderation.KICK")}`,
          msg.string("moderation.KICKED_USER", {
            member: msg.tagUser(member.user),
            author: msg.author.username,
          }),
        );
      }
    }
  }
}
