/**
 * @file MemberRoleUpdate Logger
 * @description Logs when a member is given a role through the bot
 * @module logger/MemberRoleUpdate
 */

import type { Guild, User } from "eris";
import { Logger } from "../classes/Logger";
const TYPE = "modLogging";

export class MemberRoleUpdate extends Logger {
  events = ["memberVerify", "memberUnverify", "roleAssign", "roleUnassign"];

  async run(event: string, guild: Guild, member: User, giver?: User, reason?: string[], role?: string[]) {
    /**
     * Logs when a member is verified
     */

    const guildconfig = await this.bot.db.getGuildConfig(guild.id);
    const channel = await this.getChannel(guild, TYPE, event, guildconfig);
    if (!channel) return;

    if (event === "memberVerify") {
      const string = this.bot.localeSystem.getLocaleFunction(
        guildconfig?.guildLocale ? guildconfig?.guildLocale : this.bot.config.defaultLocale,
      );

      this.bot.createMessage(channel, {
        embed: {
          color: this.convertHex("general"),
          author: {
            name: string("logger.MEMBER_VERIFIED", { user: this.tagUser(giver), member: this.tagUser(member) }),
            icon_url: member.dynamicAvatarURL(),
          },
          fields: [
            {
              name: string("global.REASON"),
              value: `${reason || string("global.NO_REASON")}`,
              inline: false,
            },
          ],
        },
      });
    }

    /**
     * Logs when a member is unverified
     */

    if (event === "memberUnverify") {
      const string = this.bot.localeSystem.getLocaleFunction(
        guildconfig?.guildLocale ? guildconfig?.guildLocale : this.bot.config.defaultLocale,
      );

      this.bot.createMessage(channel, {
        embed: {
          color: this.convertHex("error"),
          author: {
            name: string("logger.MEMBER_UNVERIFIED", { user: this.tagUser(giver), member: this.tagUser(member) }),
            icon_url: member.dynamicAvatarURL(),
          },
          fields: [
            {
              name: string("global.REASON"),
              value: `${reason || string("global.NO_REASON")}`,
              inline: false,
            },
          ],
        },
      });
    }

    /**
     * Logs when a member assigns a role
     */

    if (event === "roleAssign") {
      const string = this.bot.localeSystem.getLocaleFunction(
        guildconfig?.guildLocale ? guildconfig?.guildLocale : this.bot.config.defaultLocale,
      );

      this.bot.createMessage(channel, {
        embed: {
          color: this.convertHex("general"),
          author: {
            name: string("logger.MEMBER_SELFASSIGNED", {
              user: this.tagUser(member),
              role: role.join(", "),
              amount: role.length,
            }),
            icon_url: member.dynamicAvatarURL(),
          },
        },
      });
    }

    /**
     * Logs when a member unassigns a role
     */

    if (event === "roleUnassign") {
      const string = this.bot.localeSystem.getLocaleFunction(
        guildconfig?.guildLocale ? guildconfig?.guildLocale : this.bot.config.defaultLocale,
      );

      this.bot.createMessage(channel, {
        embed: {
          color: this.convertHex("general"),
          author: {
            name: string("logger.MEMBER_UNASSIGNED", {
              user: this.tagUser(member),
              role: role.join(", "),
              amount: role.length,
            }),
            icon_url: member.dynamicAvatarURL(),
          },
        },
      });
    }
  }
}
