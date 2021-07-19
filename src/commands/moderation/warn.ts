import type { EmbedField, Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { generateSnowflake } from "../../utils/snowflake";

export class WarnCommand extends Command {
  description = "Gives a member a warning.";
  requiredperms = ["manageMessages"];
  args = "<member:member&strict> [reason:string]";
  aliases = ["p", "punish", "s", "strike", "w", "warn"];
  staff = true;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[], args: string[]) {
    const id = generateSnowflake();
    const member = pargs[0].value as Member;
    let reason = args.slice(1).join(" ");
    if (reason.length > 512) reason = reason.slice(0, 512);

    // Inserts the point
    await this.bot.db.insertUserWarning({
      id: id,
      receiver: member.id,
      guild: msg.channel.guild.id,
      reason: reason || null,
      giver: msg.author.id,
    });

    // Gets the warned member's locale and DMs them
    const dmchannel = await member.user.getDMChannel().catch(() => {});
    if (dmchannel) {
      // Gets the victim's locale and strings to use
      const victimLocale = await this.bot.localeSystem.getUserLocale(member.id);
      const NO_REASON = this.bot.localeSystem.getLocale(`${victimLocale}`, "global.NO_REASON");
      const DM_TITLE = this.bot.localeSystem.getLocale(`${victimLocale}`, "moderation.WARN_DM_TITLE", { guild: msg.channel.guild.name });
      const DM_DESCRIPTION = this.bot.localeSystem.getLocale(`${victimLocale}`, "moderation.WARN_DM", {
        reason: reason || NO_REASON.toLowerCase(),
      });

      const DM_FOOTER = this.bot.localeSystem.getLocale(`${victimLocale}`, "moderation.WARN_FOOTER", {
        member: msg.tagUser(msg.author),
        id: id,
      });

      // Sends the DM
      dmchannel
        .createMessage({
          embed: {
            title: `⚠ ${DM_TITLE}`,
            description: DM_DESCRIPTION,
            color: msg.convertHex("error"),
            footer: {
              icon_url: msg.author.dynamicAvatarURL(),
              text: DM_FOOTER,
            },
          },
        })
        .catch(() => {});
    }

    // Emits the event
    this.bot.emit("memberWarn", msg.channel.guild, member.user, msg.author, reason, id);
    const warnings = await this.bot.db.getAllUserGuildWarnings(member.id, msg.channel.guild.id);
    const fields: EmbedField[] = [];

    // ID
    fields.push({
      name: msg.locale("global.ID"),
      value: `${id}`,
      inline: true,
    });

    // Total if over 1
    if (warnings.length > 1) {
      fields.push({
        name: msg.locale("moderation.WARN_TOTAL"),
        value: `${warnings.length}`,
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

    // Sends warning success
    msg.channel.createMessage({
      embed: {
        title: msg.locale("global.SUCCESS"),
        description: msg.locale("moderation.WARN_ADDED", { member: member.user.username }),
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
