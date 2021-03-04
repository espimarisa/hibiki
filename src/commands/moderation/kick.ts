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
        msg.string("global.ERROR"),
        msg.string("moderation.PUNISHMENT_TOOLOWROLE", {
          member: msg.tagUser(member.user),
          type: msg.string("moderation.KICK").toLowerCase(),
        }),
        "error",
      );
    }

    // Compares author roles to target
    if (roleHierarchy(msg.member, member)) {
      const kickmsg = await msg.createEmbed(
        `🔨 ${msg.string("moderation.KICK")}`,
        msg.string("moderation.PUNISHMENT_CONFIRMATION", {
          member: msg.tagUser(member.user),
          type: msg.string("moderation.KICK").toLowerCase(),
        }),
      );

      const response = (await askYesNo(this.bot, msg.string, msg.author.id, msg.channel.id).catch((err) =>
        timeoutHandler(err, kickmsg, msg.string),
      )) as ResponseData;

      // If the kick was cancelled
      if (typeof response?.response != "boolean") return;
      if (response?.response === false)
        return kickmsg.editEmbed(
          msg.string("global.CANCELLED"),
          msg.string("moderation.PUNISHMENT_CANCELLED", { member: msg.tagUser(member.user), type: msg.string("moderation.KICKING") }),
          "error",
        );

      try {
        await member.kick(`${reason} (${msg.tagUser(msg.author, true)})`);
      } catch (err) {
        await kickmsg.editEmbed(
          `🔨 ${msg.string("moderation.KICK")}`,
          msg.string("moderation.PUNISHMENT_FAILED", {
            member: msg.tagUser(member.user),
            type: msg.string("moderation.KICK").toLowerCase(),
          }),
          "error",
        );
      }

      // Gets the kicked member's locale and DMs them on kick
      const dmchannel = await member.user.getDMChannel().catch(() => {});
      if (dmchannel) {
        // Gets the victim's locale and strings to use
        const victimLocale = await this.bot.localeSystem.getUserLocale(member.id, this.bot);
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
          msg.string("global.SUCCESS"),
          msg.string("moderation.PUNISHMENT_SUCCESS", {
            member: msg.tagUser(member.user),
            type: msg.string("moderation.KICKED").toLowerCase(),
            author: msg.author.username,
          }),
          "success",
        );
      }
    }
  }
}
