/**
 * @file GuildUpdate Logger
 * @description Logs when a guild is updated
 * @module logger/GuildUpdate
 */

import type { EmbedOptions, Guild } from "eris";
import { Logger } from "../classes/Logger";
import { convertHex } from "../helpers/embed";
import { regionFormat } from "../utils/format";
const TYPE = "eventLogging";

export class GuildUpdate extends Logger {
  events = ["guildUpdate"];

  async run(event: string, guild: Guild, oldguild: Guild) {
    const channel = await this.getChannel(guild, TYPE, event);
    if (!channel) return;

    // Embed construct
    const embed = {
      color: convertHex("general"),
      author: {
        icon_url: "",
        name: "The server was edited.",
      },
      fields: [],
    } as EmbedOptions;

    // Compares names
    if (guild.name !== oldguild.name) {
      embed.fields.push({
        name: "Name",
        value: `${oldguild.name || "Unknown"} ➜ ${guild.name || "Unknown"}`,
      });
    }

    // Region differences
    if (guild.region !== oldguild.region) {
      embed.fields.push({
        name: "Region",
        value: `${regionFormat(oldguild.region) || "Unknown"} ➜ ${regionFormat(guild.region) || "Unknown"}`,
      });
    }

    // Owner differences
    if (guild.ownerID !== oldguild.ownerID) {
      embed.fields.push({
        name: "Owner",
        value: "uh",
      });
    }

    // Verification level differences
    if (guild.verificationLevel !== oldguild.verificationLevel) {
      embed.fields.push({
        name: "Verification Level",
        value: `Level ${guild.verificationLevel || "Unknown"} ➜ Level ${guild.verificationLevel || "Unknown"}`,
      });
    }

    if (!embed.fields.length) return;
    const logs = await guild.getAuditLogs(1, null, 1).catch(() => {});
    if (logs) {
      // Updates embed if needed
      const log = logs.entries[0];
      const user = logs.users[0];
      if (log && new Date().getTime() - new Date(parseInt(log.id) / 4194304 + 1420070400000).getTime() < 3000) {
        embed.author.name = `${this.tagUser(user)} edited the server.`;
        embed.author.icon_url = user.dynamicAvatarURL();
      }

      this.bot.createMessage(channel, { embed: embed });
    }
  }
}
