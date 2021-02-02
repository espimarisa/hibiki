/**
 * @file PointUpdate Logger
 * @description Logs when a member is given a point or when points are removed
 * @module logger/PointUpdate
 */

import type { Guild, User } from "eris";
import { Logger } from "../classes/Logger";
import { convertHex } from "../helpers/embed";
const TYPE = "modLogging";

export class PointUpdate extends Logger {
  events = ["reputationPointAdd", "reputationPointRemove"];

  async run(event: string, guild: Guild, member: User, giver?: User, reason?: string, ids?: string[]) {
    /**
     * Logs when reputation points are added
     */

    const guildconfig = await this.bot.db.getGuildConfig(guild.id);
    const channel = await this.getChannel(guild, TYPE, event, guildconfig);
    if (!channel) return;

    if (event === "reputationPointAdd") {
      const string = this.bot.localeSystem.getLocaleFunction(guildconfig?.locale ? guildconfig?.locale : this.bot.config.defaultLocale);

      this.bot.createMessage(channel, {
        embed: {
          color: convertHex("general"),
          author: {
            name: string("logger.POINT_GIVEN", { giver: this.tagUser(giver), member: this.tagUser(member) }),
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
     * Logs when reputation points are removed
     */

    if (event === "reputationPointRemove") {
      const string = this.bot.localeSystem.getLocaleFunction(guildconfig?.locale ? guildconfig?.locale : this.bot.config.defaultLocale);

      this.bot.createMessage(channel, {
        embed: {
          color: convertHex("general"),
          author: {
            name: string("logger.POINT_REMOVED", { giver: this.tagUser(giver) }),
            icon_url: member.dynamicAvatarURL(),
          },
          fields: [
            {
              name: string("logger.POINT_IDS"),
              value: ids.map((i) => `\`${i}\``).join(", "),
              inline: false,
            },
          ],
        },
      });
    }
  }
}
