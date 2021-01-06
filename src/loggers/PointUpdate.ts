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

    if (event === "reputationPointAdd") {
      const channel = await this.getChannel(guild, TYPE, event);
      if (!channel) return;

      this.bot.createMessage(channel, {
        embed: {
          color: convertHex("general"),
          author: {
            name: `${this.tagUser(giver)} gave ${this.tagUser(member)} a reputation point.`,
            icon_url: member.dynamicAvatarURL(),
          },
          fields: [
            {
              name: "Reason",
              value: `${reason}`,
              inline: false,
            },
            {
              name: "ID",
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
      const channel = await this.getChannel(guild, TYPE, event);
      if (!channel) return;

      this.bot.createMessage(channel, {
        embed: {
          color: convertHex("general"),
          author: {
            name: `${this.tagUser(giver)} removed reputation points.`,
            icon_url: member.dynamicAvatarURL(),
          },
          fields: [
            {
              name: "Point IDs",
              value: ids.map((i) => `\`${i}\``).join(", "),
              inline: false,
            },
          ],
        },
      });
    }
  }
}
