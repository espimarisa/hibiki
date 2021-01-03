/**
 * @file ChannelUpdate logger
 * @description Logs when a channel is created, deleted, or updated
 */

import type { TextChannel } from "eris";
import { convertHex } from "../helpers/embed";
import { Logger } from "../classes/Logger";
const TYPE = "eventLogging";

export class ChannelUpdate extends Logger {
  events = ["channelCreate", "channelDelete", "channelUpdate"];

  async run(event: string, channel: TextChannel, oldchannel: TextChannel) {
    /** Logs channel creations */
    if (event === "channelCreate") {
      const loggingChannel = await this.getChannel(channel.guild, TYPE, event);
      if (!loggingChannel) return;

      const embed = {
        color: convertHex("general"),
        description: `<#${channel.id}> (${channel.id})`,
        author: {
          icon_url: "",
          name: `#${channel.name} created`,
        },
      };

      // Reads the audit logs
      const logs = await channel.guild.getAuditLogs(1, null, 10).catch(() => {});
      if (logs) {
        const log = logs.entries[0];
        const user = logs.users[0];
        // Adds to the embed
        // @ts-expect-error
        if (log && new Date().getTime() - new Date(log.id / 4194304 + 1420070400000).getTime() < 3000) {
          embed.author.name = `${this.tagUser(user)} created a channel.`;
          embed.author.icon_url = user.dynamicAvatarURL();
        }
      }

      this.bot.createMessage(loggingChannel, { embed: embed });
    }

    /** Logs channel deletions */
    if (event === "channelDelete") {
      const loggingChannel = await this.getChannel(channel.guild, TYPE, event);
      if (!loggingChannel) return;

      // Sends when a channel is deleted
      const embed = {
        color: convertHex("error"),
        description: `**ID:** ${channel.id}`,
        author: {
          icon_url: "",
          name: `#${channel.name} deleted`,
        },
      };

      // Reads the audit logs
      const logs = await channel.guild.getAuditLogs(1, null, 12).catch(() => {});
      if (logs) {
        const log = logs.entries[0];
        const user = logs.users[0];
        // Adds to the embed
        // @ts-expect-error
        if (log && new Date().getTime() - new Date(log.id / 4194304 + 1420070400000).getTime() < 3000) {
          embed.author.name = `${this.tagUser(user)} deleted #${channel.name}.`;
          embed.author.icon_url = user.avatarURL;
        }
      }

      this.bot.createMessage(loggingChannel, { embed: embed });
    }

    /** Logs channel updates */
    if (event === "channelUpdate") {
      // eris fuckery
      const loggingChannel = await this.getChannel(channel.guild, TYPE, event);
      if (!loggingChannel) return;

      const embed = {
        color: convertHex("general"),
        author: {
          icon_url: "",
          name: `#${oldchannel.name} edited`,
        },
        // @ts-expect-error
        fields: [],
      };

      // Channel name differences
      if (channel.name !== oldchannel.name) {
        embed.fields.push({
          name: "Name",
          value: `${oldchannel.name} ➜ ${channel.name}`,
        });
      }

      // Topic differences
      if (channel.topic !== oldchannel.topic) {
        embed.fields.push({
          name: "Topic",
          value: `${oldchannel.topic} ➜ ${channel.topic}`,
        });
      }

      // NSFW differences
      if (channel.nsfw !== oldchannel.nsfw) {
        embed.fields.push({
          name: "NSFW",
          value: `${channel.nsfw ? "Enabled" : "Disabled"} ➜ ${oldchannel.nsfw ? "Enabled" : "Disabled"}`,
        });
      }

      // // Bitrate differences
      // if (channel.bitrate && channel.bitrate !== oldchannel.bitrate) {
      //   embed.fields.push({
      //     name: "Bitrate",
      //     value: `${oldchannel.bitrate} ➜ ${channel.bitrate}`,
      //   });
      // }

      // Slowmode differences
      if (channel.rateLimitPerUser !== oldchannel.rateLimitPerUser) {
        embed.fields.push({
          name: "Slowmode",
          value: `${oldchannel.rateLimitPerUser === 0 ? "No cooldown" : `${oldchannel.rateLimitPerUser} seconds`} ➜ ${
            channel.rateLimitPerUser === 0 ? "No cooldown" : `${channel.rateLimitPerUser} seconds`
          }`,
        });
      }

      // Reads the audit logs
      // if (!embed.fields.length) return;
      const logs = await channel.guild.getAuditLogs(1, null, 11).catch(() => {});
      if (logs) {
        // Updates embed if needed
        const log = logs.entries[0];
        const user = logs.users[0];
        // @ts-expect-error
        if (log && new Date().getTime() - new Date(log.id / 4194304 + 1420070400000).getTime() < 3000) {
          embed.author.name = `${this.tagUser(user)} edited #${oldchannel.name}.`;
          embed.author.icon_url = user.avatarURL;
        }
      }
    }
  }
}
