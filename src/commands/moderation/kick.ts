import type { Member, Message, TextChannel } from "eris";
import type { ResponseData } from "../../typings/utils";
import { Command } from "../../classes/Command";
import { askYesNo } from "../../utils/ask";
import { roleHierarchy } from "../../utils/hierarchy";
import { timeoutHandler } from "../../utils/waitFor";

export class KickCommand extends Command {
  description = "Kicks a member from the server.";
  clientperms = ["kickMembers"];
  requiredperms = ["kickMembers"];
  args = "<member:member&strict> [reason:string]";
  aliases = ["getout", "k"];
  staff = true;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[], args: string[]) {
    // Gets the member and reason
    const member = pargs[0].value as Member;
    let reason = args.slice(1).join(" ");
    if (reason.length > 512) reason = reason.slice(0, 512);

    // Compares bot roles to target's roles
    if (!roleHierarchy(msg.channel.guild.members.get(this.bot.user.id), member)) {
      return msg.createEmbed(
        msg.locale("global.ERROR"),
        msg.locale("moderation.PUNISHMENT_TOOLOWROLE", {
          member: msg.tagUser(member.user),
          type: msg.locale("moderation.KICK").toLowerCase(),
        }),
        "error",
      );
    }

    // Compares author roles to target
    if (roleHierarchy(msg.member, member)) {
      const kickmsg = await msg.createEmbed(
        `🔨 ${msg.locale("moderation.KICK")}`,
        msg.locale("moderation.PUNISHMENT_CONFIRMATION", {
          member: msg.tagUser(member.user),
          type: msg.locale("moderation.KICK").toLowerCase(),
        }),
      );

      const response = (await askYesNo(this.bot, msg.locale, msg.author.id, msg.channel.id).catch((err) =>
        timeoutHandler(err, kickmsg, msg.locale),
      )) as ResponseData;

      // If the kick was cancelled
      if (!response || response?.response === false)
        return kickmsg.editEmbed(
          msg.locale("global.CANCELLED"),
          msg.locale("moderation.PUNISHMENT_CANCELLED", { member: msg.tagUser(member.user), type: msg.locale("moderation.KICKING") }),
          "error",
        );

      try {
        await member.kick(`${reason} (${msg.tagUser(msg.author, true)})`);
      } catch (err) {
        await kickmsg.editEmbed(
          `🔨 ${msg.locale("moderation.KICK")}`,
          msg.locale("moderation.PUNISHMENT_FAILED", {
            member: msg.tagUser(member.user),
            type: msg.locale("moderation.KICK").toLowerCase(),
          }),
          "error",
        );
      }

      // Gets the kicked member's locale and DMs them on kick
      const dmchannel = await member.user.getDMChannel().catch(() => {});
      if (dmchannel) {
        // Gets the victim's locale and strings to use
        const victimLocale = await this.bot.localeSystem.getUserLocale(member.id);
        const NO_REASON = this.bot.localeSystem.getLocale(`${victimLocale}`, "global.NO_REASON");
        const TYPE = this.bot.localeSystem.getLocale(`${victimLocale}`, "moderation.KICKED");

        const DM_TITLE = this.bot.localeSystem.getLocale(`${victimLocale}`, "moderation.PUNISHMENT_DM_TITLE", {
          guild: msg.channel.guild.name,
          type: this.bot.localeSystem.getLocale(`${victimLocale}`, "moderation.KICKED"),
        });

        const DM_DESCRIPTION = this.bot.localeSystem.getLocale(`${victimLocale}`, "moderation.PUNISHMENT_DM", {
          type: TYPE.toLowerCase(),
          reason: reason || NO_REASON.toLowerCase(),
        });

        const DM_FOOTER = this.bot.localeSystem.getLocale(`${victimLocale}`, "moderation.PUNISHMENT_FOOTER", {
          member: msg.tagUser(msg.author),
          type: TYPE,
        });

        // Sends the DM
        dmchannel
          .createMessage({
            embed: {
              title: `${DM_TITLE}`,
              description: DM_DESCRIPTION,
              color: msg.convertHex("error"),
              footer: {
                icon_url: msg.author.dynamicAvatarURL(),
                text: DM_FOOTER,
              },
            },
          })
          .catch(() => {});

        await kickmsg.editEmbed(
          msg.locale("global.SUCCESS"),
          msg.locale("moderation.PUNISHMENT_SUCCESS", {
            member: msg.tagUser(member.user),
            type: msg.locale("moderation.KICKED").toLowerCase(),
            author: msg.author.username,
          }),
          "success",
        );
      }
    }
  }
}
