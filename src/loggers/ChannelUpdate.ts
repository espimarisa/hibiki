/**
 * @file ChannelUpdate logger
 * @description Logs when a channel is created, deleted, or updated
 * @module logger/ChannelUpdate
 */

import type { EmbedOptions, TextChannel, VoiceChannel } from "eris";
import { Logger } from "../classes/Logger";
import { dateFormat } from "../utils/format";
const TYPE = "eventLogging";

export class ChannelUpdate extends Logger {
  events = ["channelCreate", "channelDelete", "channelUpdate"];

  async run(event: string, channel: TextChannel, oldchannel: TextChannel) {
    if (!channel || !channel.guild) return;

    /**
     * Logs channel creations
     */

    switch (event) {
      case "channelCreate": {
        const guildconfig = await this.bot.db.getGuildConfig(channel.guild.id);
        const loggingChannel = await this.getChannel(channel.guild, TYPE, event, guildconfig);
        if (!loggingChannel) return;
        const string = this.bot.localeSystem.getLocaleFunction(
          guildconfig?.guildLocale ? guildconfig?.guildLocale : this.bot.config.defaultLocale,
        );

        const embed = {
          color: this.convertHex("general"),
          author: {
            icon_url: this.bot.user.dynamicAvatarURL(),
            name: string("logger.CHANNEL_CREATED", { channel: channel.name }),
          },
          fields: [
            {
              name: string("global.NAME"),
              value: channel.name,
              inline: false,
            },
            {
              name: string("global.ID"),
              value: channel.id,
              inline: true,
            },
            {
              name: string("global.CREATED"),
              value: `${dateFormat(channel.createdAt, string)}`,
              inline: true,
            },
          ],
        } as EmbedOptions;

        // Reads the audit logs
        const logs = await channel.guild.getAuditLogs(1, null, 10).catch(() => {});
        if (logs) {
          const log = logs?.entries?.[0];
          const user = logs?.users?.[0];

          // Adds log info to the embed
          if (log && new Date().getTime() - new Date(parseInt(log.id) / 4194304 + 1420070400000).getTime() < 3000) {
            embed.author.name = string("logger.CHANNEL_CREATEDBY", { user: this.tagUser(user) });
            embed.author.icon_url = user?.dynamicAvatarURL();
          }
        }

        this.bot.createMessage(loggingChannel, { embed: embed });
        break;
      }

      /**
       * Logs channel deletions
       */

      case "channelDelete": {
        const guildconfig = await this.bot.db.getGuildConfig(channel.guild.id);
        const loggingChannel = await this.getChannel(channel.guild, TYPE, event, guildconfig);
        if (!loggingChannel) return;
        const string = this.bot.localeSystem.getLocaleFunction(
          guildconfig?.guildLocale ? guildconfig?.guildLocale : this.bot.config.defaultLocale,
        );

        const embed = {
          color: this.convertHex("error"),
          author: {
            icon_url: this.bot.user.dynamicAvatarURL(),
            name: string("logger.CHANNEL_DELETED", { channel: channel.name }),
          },
          fields: [
            {
              name: string("global.NAME"),
              value: `${channel.name || string("global.UNKNOWN")}`,
              inline: false,
            },
            {
              name: string("global.ID"),
              value: channel.id,
              inline: true,
            },
            {
              name: string("global.CREATED"),
              value: `${dateFormat(channel.createdAt, string) || string("global.UNKNOWN")}`,
              inline: true,
            },
          ],
        } as EmbedOptions;

        // Reads the audit logs
        const logs = await channel.guild.getAuditLogs(1, null, 12).catch(() => {});
        if (logs) {
          const log = logs?.entries?.[0];
          const user = logs?.users?.[0];

          // Adds log info to the embed
          if (log && new Date().getTime() - new Date(parseInt(log.id) / 4194304 + 1420070400000).getTime() < 3000) {
            embed.author.name = string("logger.CHANNEL_DELETEDBY", { user: this.tagUser(user) });
            embed.author.icon_url = user?.dynamicAvatarURL();
          }
        }

        this.bot.createMessage(loggingChannel, { embed: embed });
        break;
      }

      /**
       * Logs channel updates
       */

      case "channelUpdate": {
        // Gets the logging channel
        if (!oldchannel) return;
        const guildconfig = await this.bot.db.getGuildConfig(channel.guild.id);
        const loggingChannel = await this.getChannel(channel.guild, TYPE, event, guildconfig);
        if (!loggingChannel) return;
        const string = this.bot.localeSystem.getLocaleFunction(
          guildconfig?.guildLocale ? guildconfig?.guildLocale : this.bot.config.defaultLocale,
        );

        const embed = {
          color: this.convertHex("general"),
          fields: [],
          author: {
            icon_url: this.bot.user.dynamicAvatarURL(),
            name: string("logger.CHANNEL_EDITED", { channel: oldchannel.name }),
          },
        } as EmbedOptions;

        // Channel name differences
        if (channel.name !== oldchannel.name) {
          embed.fields.push({
            name: string("global.NAME"),
            value: `${oldchannel.name || "No name"} ➜ ${channel.name || "No name"}`,
          });
        }

        // Topic differences
        if (channel.topic !== oldchannel.topic) {
          embed.fields.push({
            name: string("global.TOPIC"),
            value: `${oldchannel.topic || "No topic"} ➜ ${channel.topic || "No topic"}`,
          });
        }

        // NSFW differences
        if ((channel.nsfw === true && oldchannel.nsfw === false) || (channel.nsfw === false && oldchannel.nsfw === true)) {
          embed.fields.push({
            name: string("global.NSFW"),
            value: `${channel.nsfw ? string("logger.ENABLED") : string("logger.DISABLED")} ➜ ${
              oldchannel.nsfw ? string("logger.ENABLED") : string("logger.DISABLED")
            }`,
          });
        }

        // Bitrate differences
        if (((channel as unknown) as VoiceChannel)?.bitrate !== ((oldchannel as unknown) as VoiceChannel)?.bitrate) {
          embed.fields.push({
            name: string("global.BITRATE"),
            value: `${((oldchannel as unknown) as VoiceChannel)?.bitrate} ➜ ${((channel as unknown) as VoiceChannel)?.bitrate}`,
          });
        }

        // Slowmode differences
        if (channel.rateLimitPerUser !== oldchannel.rateLimitPerUser) {
          embed.fields.push({
            name: string("global.SLOWMODE"),
            value: `${
              oldchannel.rateLimitPerUser === 0 ? string("global.NONE") : `${oldchannel.rateLimitPerUser} ${string("logger.SECONDS")}`
            } ➜ ${channel.rateLimitPerUser === 0 ? string("global.NONE") : `${channel.rateLimitPerUser} ${string("logger.SECONDS")}`}`,
          });
        }

        // Reads the audit logs
        if (!embed.fields.length) return;
        const logs = await channel.guild.getAuditLogs(1, null, 11).catch(() => {});
        if (logs) {
          // Adds log info to the embed
          const log = logs?.entries?.[0];
          const user = logs?.users?.[0];

          if (log && new Date().getTime() - new Date(parseInt(log.id) / 4194304 + 1420070400000).getTime() < 3000) {
            embed.author.name = string("logger.CHANNEL_EDITEDBY", { user: this.tagUser(user), channel: oldchannel.name });
            embed.author.icon_url = user?.dynamicAvatarURL();
          }
        }

        this.bot.createMessage(loggingChannel, { embed: embed });
        break;
      }
    }
  }
}
