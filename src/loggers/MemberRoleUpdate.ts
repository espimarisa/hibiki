/**
 * @file MemberRoleUpdate Logger
 * @description Logs when a member is given a role through the bot
 * @module logger/MemberRoleUpdate
 */

import type { Guild, Role, User } from "eris";
import { Logger } from "../classes/Logger";
import { convertHex } from "../helpers/embed";
import config from "../../config.json";
const TYPE = "modLogging";

export class MemberRoleUpdate extends Logger {
  events = ["memberVerify", "memberUnverify", "roleAssign", "roleUnassign"];

  async run(event: string, guild: Guild, member: User, giver?: User, reason?: string[], role?: Role) {
    /**
     * Logs when a member is verified
     */

    if (event === "memberVerify") {
      const channel = await this.getChannel(guild, TYPE, event);
      if (!channel) return;
      const guildconfig = await this.bot.db.getGuildConfig(guild.id);
      const string = this.bot.localeSystem.getLocaleFunction(guildconfig?.locale ? guildconfig?.locale : config.defaultLocale);

      this.bot.createMessage(channel, {
        embed: {
          color: convertHex("general"),
          author: {
            name: string("logger.MEMBER_VERIFIED", { user: this.tagUser(giver), member: this.tagUser(member) }),
            icon_url: member.dynamicAvatarURL(),
          },
          fields: [
            {
              name: string("global.REASON"),
              value: `${reason}`,
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
      const channel = await this.getChannel(guild, TYPE, event);
      if (!channel) return;
      const guildconfig = await this.bot.db.getGuildConfig(guild.id);
      const string = this.bot.localeSystem.getLocaleFunction(guildconfig?.locale ? guildconfig?.locale : config.defaultLocale);

      this.bot.createMessage(channel, {
        embed: {
          color: convertHex("error"),
          author: {
            name: string("logger.MEMBER_UNVERIFIED", { user: this.tagUser(giver), member: this.tagUser(member) }),
            icon_url: member.dynamicAvatarURL(),
          },
          fields: [
            {
              name: string("global.REASON"),
              value: `${reason}`,
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
      const channel = await this.getChannel(guild, TYPE, event);
      if (!channel) return;
      const guildconfig = await this.bot.db.getGuildConfig(guild.id);
      const string = this.bot.localeSystem.getLocaleFunction(guildconfig?.locale ? guildconfig?.locale : config.defaultLocale);

      this.bot.createMessage(channel, {
        embed: {
          color: convertHex("general"),
          author: {
            name: string("logger.MEMBER_SELFASSIGNED", { user: this.tagUser(member), role: role.name }),
            icon_url: member.dynamicAvatarURL(),
          },
        },
      });
    }

    /**
     * Logs when a member unassigns a role
     */

    if (event === "roleUnassign") {
      const channel = await this.getChannel(guild, TYPE, event);
      if (!channel) return;
      const guildconfig = await this.bot.db.getGuildConfig(guild.id);
      const string = this.bot.localeSystem.getLocaleFunction(guildconfig?.locale ? guildconfig?.locale : config.defaultLocale);

      this.bot.createMessage(channel, {
        embed: {
          color: convertHex("general"),
          author: {
            name: string("logger.MEMBER_UNASSIGNED", { user: this.tagUser(member), role: role.name }),
            icon_url: member.dynamicAvatarURL(),
          },
        },
      });
    }
  }
}
