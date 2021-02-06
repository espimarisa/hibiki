import type { Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { roleHierarchy } from "../../utils/hierarchy";

export class NicknameCommand extends Command {
  description = "idknicknamebro";
  clientperms = ["manageNicknames"];
  requiredperms = ["manageNicknames"];
  args = "<member:member&strict> [nickname:string]";
  aliases = ["nick", "set-nick", "set-nickname"];
  staff = true;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[], args: string[]) {
    const member = pargs[0].value as Member;
    const nickname = args.slice(1).join(" ");

    // Nickname changes
    if (nickname) {
      // If the bot's role isn't high enough to update the member's role
      if (!roleHierarchy(msg.channel.guild.members.get(this.bot.user.id), member)) {
        return msg.createEmbed(
          msg.string("global.ERROR"),
          msg.string("moderation.NICKNAME_TOOLOWROLE", { member: msg.tagUser(member.user) }),
          "error",
        );
      }

      // Nickname clearing
      if (nickname === "clear") {
        try {
          await msg.channel.guild.members.get(member.id).edit({ nick: null }, `Changed by ${msg.tagUser(msg.author, true)}`);
        } catch (err) {
          // Sends if failed
          return msg.createEmbed(
            msg.string("global.ERROR"),
            msg.string("moderation.NICKNAME_FAILED", { member: msg.tagUser(member.user) }),
            "error",
          );
        }

        // Sends when cleared
        return msg.createEmbed(
          msg.string("global.SUCCESS"),
          msg.string("moderation.NICKNAME_CLEARED", { member: msg.tagUser(member.user) }),
          "success",
        );
      }

      // If nickname is too long
      else if (nickname.length > 32) {
        return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.NICKNAME_TOOLONG"), "error");
      }

      // Updates the nickname
      try {
        await msg.channel.guild.members.get(member.id).edit({ nick: nickname }, `Changed by ${msg.tagUser(msg.author, true)}`);
      } catch (err) {
        return msg.createEmbed(
          msg.string("global.ERROR"),
          msg.string("moderation.NICKNAME_FAILED", { member: msg.tagUser(member.user) }),
          "error",
        );
      }
    } else if (!nickname) {
      // Shows user's nickname
      if (member.nick) {
        return msg.createEmbed(
          `📛 ${msg.string("global.NICKNAME")}`,
          msg.string("moderation.NICKNAME_MEMBER", { member: msg.tagUser(member.user), nickname: member.nick }),
        );
      }

      // If user has no nickname
      else if (!member.nick) {
        return msg.createEmbed(
          msg.string("global.ERROR"),
          msg.string("moderation.NICKNAME_NOTSET", { member: msg.tagUser(member.user) }),
          "error",
        );
      }
    }

    // Sends when nickname changed
    msg.createEmbed(
      msg.string("global.SUCCESS"),
      msg.string("moderation.NICKNAME_SET", {
        member: msg.tagUser(member.user),
        length: member.nick?.length ? 0 : 1,
      }),
      "success",
    );
  }
}
