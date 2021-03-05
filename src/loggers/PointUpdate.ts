/**
 * @file PointUpdate Logger
 * @description Logs when a member is given a point or when points are removed
 * @module logger/PointUpdate
 */

import type { Guild, User } from "eris";
import { Logger } from "../classes/Logger";
const TYPE = "modLogging";

export class PointUpdate extends Logger {
  events = ["reputationPointAdd", "reputationPointRemove"];

  async run(event: string, guild: Guild, member: User, giver?: User, reason?: string, ids?: string[]) {
    const guildconfig = await this.bot.db.getGuildConfig(guild.id);
    const channel = await this.getChannel(guild, TYPE, event, guildconfig);
    if (!channel) return;

    switch (event) {
      /**
       * Logs when reputation points are added
       */

      case "reputationPointAdd": {
        const string = this.bot.localeSystem.getLocaleFunction(
          guildconfig?.guildLocale ? guildconfig?.guildLocale : this.bot.config.defaultLocale,
        );

        this.bot.createMessage(channel, {
          embed: {
            color: this.convertHex("general"),
            author: {
              name: string("logger.POINT_GIVEN", { giver: this.tagUser(giver), member: this.tagUser(member) }),
              icon_url: member.dynamicAvatarURL(),
            },
            fields: [
              {
                name: string("global.REASON"),
                value: `${reason || string("global.NO_REASON")}`,
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

        break;
      }

      /**
       * Logs when reputation points are removed
       */

      case "reputationPointRemove": {
        const string = this.bot.localeSystem.getLocaleFunction(
          guildconfig?.guildLocale ? guildconfig?.guildLocale : this.bot.config.defaultLocale,
        );

        this.bot.createMessage(channel, {
          embed: {
            color: this.convertHex("general"),
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

        break;
      }
    }
  }
}
