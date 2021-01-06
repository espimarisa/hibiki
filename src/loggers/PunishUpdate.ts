/**
 * @file PunishUpdate Logger
 * @description Logs when a member is muted or warned
 * @module logger/PunishUpdate
 */

import type { Guild, User } from "eris";
import { Logger } from "../classes/Logger";
import { convertHex } from "../helpers/embed";
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

      this.bot.createMessage(channel, {
        embed: {
          color: convertHex("error"),
          author: {
            name: `${this.tagUser(giver)} muted ${this.tagUser(member)}.`,
            icon_url: member.dynamicAvatarURL(),
          },
          fields: [
            {
              name: "Reason",
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

      this.bot.createMessage(channel, {
        embed: {
          color: convertHex("success"),
          author: {
            name: `${this.tagUser(giver)} unmuted ${this.tagUser(member)}.`,
            icon_url: member.dynamicAvatarURL(),
          },
          fields: [
            {
              name: "Reason",
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

      this.bot.createMessage(channel, {
        embed: {
          color: convertHex("error"),
          author: {
            name: `${this.tagUser(giver)} warned ${this.tagUser(member)}.`,
            icon_url: member.dynamicAvatarURL(),
          },
          fields: [
            {
              name: "Reason",
              value: `${reason}`,
              inline: false,
            },
            {
              name: "Warning ID",
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

      this.bot.createMessage(channel, {
        embed: {
          color: convertHex("success"),
          author: {
            name: `${this.tagUser(giver)} removed warnings.`,
            icon_url: member.dynamicAvatarURL(),
          },
          fields: [
            {
              name: "Warning IDs",
              value: ids.map((i) => `\`${i}\``).join(", "),
              inline: false,
            },
          ],
        },
      });
    }
  }
}
