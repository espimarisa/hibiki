/**
 * @file PunishUpdate Logger
 * @description Logs when a member is muted or warned
 * @module logger/PunishUpdate
 */

import type { Guild, User } from "eris";
import { Logger } from "../classes/Logger";
import { convertHex } from "../helpers/embed";
import config from "../../config.json";
const TYPE = "modLogging";

export class PunishUpdate extends Logger {
  events = ["memberMute", "memberUnmute", "memberWarn", "memberWarnRemove"];

  async run(event: string, guild: Guild, member: User, giver?: User, reason?: string, ids?: string[]) {
    /**
     * Logs when a member is muted
     */

    if (event === "memberMute") {
      const channel = await this.getChannel(guild, TYPE, event);
      if (!channel) return;
      const guildconfig = await this.bot.db.getGuildConfig(guild.id);
      const string = this.bot.localeSystem.getLocaleFunction(guildconfig?.locale ? guildconfig?.locale : config.defaultLocale);

      this.bot.createMessage(channel, {
        embed: {
          color: convertHex("error"),
          author: {
            name: string("logger.MEMBER_MUTED", { giver: this.tagUser(giver), member: this.tagUser(member) }),
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
     * Logs when a member is unmuted
     */

    if (event === "memberUnmute") {
      const channel = await this.getChannel(guild, TYPE, event);
      if (!channel) return;
      const guildconfig = await this.bot.db.getGuildConfig(guild.id);
      const string = this.bot.localeSystem.getLocaleFunction(guildconfig?.locale ? guildconfig?.locale : config.defaultLocale);

      this.bot.createMessage(channel, {
        embed: {
          color: convertHex("success"),
          author: {
            name: string("logger.MEMBER_UNMUTED", { giver: this.tagUser(giver), member: this.tagUser(member) }),
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
     * Logs when a member is warned
     */

    if (event === "memberWarn") {
      const channel = await this.getChannel(guild, TYPE, event);
      if (!channel) return;
      const guildconfig = await this.bot.db.getGuildConfig(guild.id);
      const string = this.bot.localeSystem.getLocaleFunction(guildconfig?.locale ? guildconfig?.locale : config.defaultLocale);

      this.bot.createMessage(channel, {
        embed: {
          color: convertHex("error"),
          author: {
            name: string("logger.MEMBER_WARNED", { giver: this.tagUser(giver), member: this.tagUser(member) }),
            icon_url: member.dynamicAvatarURL(),
          },
          fields: [
            {
              name: string("global.REASON"),
              value: `${reason}`,
              inline: false,
            },
            {
              name: string("global.ID"),
              value: `${ids}`,
              inline: false,
            },
          ],
        },
      });
    }

    /**
     * Logs when a member's warning(s) are removed
     */

    if (event === "memberWarnRemove") {
      const channel = await this.getChannel(guild, TYPE, event);
      if (!channel) return;
      const guildconfig = await this.bot.db.getGuildConfig(guild.id);
      const string = this.bot.localeSystem.getLocaleFunction(guildconfig?.locale ? guildconfig?.locale : config.defaultLocale);

      this.bot.createMessage(channel, {
        embed: {
          color: convertHex("success"),
          author: {
            name: string("logger.WARNING_REMOVED", { giver: this.tagUser(giver) }),
            icon_url: member.dynamicAvatarURL(),
          },
          fields: [
            {
              name: string("logger.WARNING_IDS"),
              value: ids.map((i) => `\`${i}\``).join(", "),
              inline: false,
            },
          ],
        },
      });
    }
  }
}
