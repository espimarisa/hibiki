/**
 * @file GuildUpdate Logger
 * @description Logs when a guild is updated
 * @module logger/GuildUpdate
 */

import type { EmbedOptions, Guild } from "eris";
import { Logger } from "../classes/Logger";

import {
  afkTimeoutFormat,
  contentFilterFormat,
  mfaLevelFormat,
  notificationLevelFormat,
  regionFormat,
  verificationLevelFormat,
} from "../utils/format";

const TYPE = "eventLogging";

export class GuildUpdate extends Logger {
  events = ["guildUpdate"];

  async run(event: string, guild: Guild, oldguild: Guild) {
    // Gets locales
    const guildconfig = await this.bot.db.getGuildConfig(guild.id);
    const channel = await this.getChannel(guild, TYPE, event, guildconfig);
    if (!channel) return;
    const string = this.bot.localeSystem.getLocaleFunction(
      guildconfig.guildLocale ? guildconfig.guildLocale : this.bot.config.defaultLocale,
    );

    // Embed construct
    const embed = {
      color: this.convertHex("general"),
      author: {
        icon_url: this.bot.user.dynamicAvatarURL(),
        name: string("logger.GUILD_EDITED"),
      },
      fields: [],
    } as EmbedOptions;

    // Compares names
    if (guild.name !== oldguild.name) {
      embed.fields.push({
        name: string("global.NAME"),
        value: `${oldguild.name} ➜ ${guild.name}`,
      });
    }

    // Owner differences
    if (guild.ownerID !== oldguild.ownerID) {
      embed.fields.push({
        name: string("global.OWNER"),
        value: `${this.tagUser(this.bot.users.find((m) => m.id === oldguild.ownerID))} ➜ ${
          this.tagUser(this.bot.users.find((m) => m.id === guild.ownerID)) || guild.ownerID
        }`,
      });
    }

    // Region differences
    if (guild.region !== oldguild.region) {
      embed.fields.push({
        name: string("global.REGION"),
        value: `${regionFormat(oldguild.region) || string("global.UNKNOWN")} ➜ ${regionFormat(guild.region) || string("global.UNKNOWN")}`,
        inline: true,
      });
    }

    // MFA Level
    if (guild.mfaLevel !== oldguild.mfaLevel) {
      embed.fields.push({
        name: string("general.SERVER_2FA"),
        value: `${mfaLevelFormat(string, oldguild.mfaLevel)} ➜ ${mfaLevelFormat(string, guild.mfaLevel)}`,
        inline: true,
      });
    }

    // Verification level
    if (guild.verificationLevel !== oldguild.verificationLevel) {
      embed.fields.push({
        name: string("general.SERVER_VERIFICATION"),
        value: `${verificationLevelFormat(string, oldguild.verificationLevel)} ➜ ${verificationLevelFormat(
          string,
          guild.verificationLevel,
        )}`,
      });
    }

    // Explicit content filter
    if (guild.explicitContentFilter !== oldguild.explicitContentFilter) {
      embed.fields.push({
        name: string("general.SERVER_CONTENT_FILTER"),
        value: `${contentFilterFormat(string, oldguild.explicitContentFilter)} ➜ ${contentFilterFormat(
          string,
          guild.explicitContentFilter,
        )}`,
      });
    }

    // Notification settings
    if (guild.defaultNotifications !== oldguild.defaultNotifications) {
      embed.fields.push({
        name: string("general.SERVER_NOTIFICATION_LEVEL"),
        value: `${notificationLevelFormat(string, oldguild.defaultNotifications)} ➜ ${notificationLevelFormat(
          string,
          guild.defaultNotifications,
        )}`,
      });
    }

    // AFK channels
    if (guild.afkChannelID !== oldguild.afkChannelID) {
      embed.fields.push({
        name: string("general.SERVER_AFK_CHANNEL"),
        value: `${oldguild.afkChannelID ? guild.channels.get(oldguild.afkChannelID).mention : string("global.NONE")} ➜ ${
          guild.afkChannelID ? guild.channels.get(guild.afkChannelID).mention : string("global.NONE")
        }`,
      });
    }

    // System channel changes
    if (guild.systemChannelID !== oldguild.systemChannelID) {
      embed.fields.push({
        name: string("general.SERVER_SYSTEMMESSAGE_CHANNEL"),
        value: `${oldguild.systemChannelID ? guild.channels.get(oldguild.systemChannelID).mention : string("global.NONE")} ➜ ${
          guild.systemChannelID ? guild.channels.get(guild.systemChannelID).mention : string("global.NONE")
        }`,
      });
    }

    // Public updates channel
    if (guild.publicUpdatesChannelID !== oldguild.publicUpdatesChannelID) {
      embed.fields.push({
        name: string("general.SERVER_UPDATES_CHANNEL"),
        value: `${
          oldguild.publicUpdatesChannelID ? guild.channels.get(oldguild.publicUpdatesChannelID).mention : string("global.NONE")
        } ➜ ${guild.publicUpdatesChannelID ? guild.channels.get(guild.publicUpdatesChannelID).mention : string("global.NONE")}`,
      });
    }

    // Rule channel changes
    if (guild.rulesChannelID !== oldguild.rulesChannelID) {
      embed.fields.push({
        name: string("general.SERVER_RULES_CHANNEL"),
        value: `${oldguild.rulesChannelID ? guild.channels.get(oldguild.rulesChannelID).mention : string("global.NONE")} ➜ ${
          guild.rulesChannelID ? guild.channels.get(guild.rulesChannelID).mention : string("global.NONE")
        }`,
      });
    }

    // Public description
    if (guild.description !== oldguild.description) {
      embed.fields.push({
        name: string("global.DESCRIPTION"),
        value: `${oldguild.description || string("global.NONE")} ➜ ${guild.description || string("global.NONE")}`,
      });
    }

    // Preferred locales
    if (guild.preferredLocale !== oldguild.preferredLocale) {
      embed.fields.push({
        name: string("general.SERVER_PREFERRED_LANGUAGE"),
        value: `${oldguild.preferredLocale || "en-US"} ➜ ${guild.preferredLocale || "en-US"}`,
      });
    }

    // AFK timeouts
    if (guild.afkTimeout !== oldguild.afkTimeout) {
      embed.fields.push({
        name: string("general.SERVER_AFK_TIMEOUT"),
        value: `${afkTimeoutFormat(string, oldguild.afkTimeout)} ➜ ${afkTimeoutFormat(string, guild.afkTimeout)}`,
      });
    }

    if (!embed.fields.length) return;
    const logs = await guild.getAuditLogs(1, null, 1).catch(() => {});
    if (logs) {
      // Updates embed if needed
      const log = logs.entries[0];
      const user = logs.users[0];
      if (log && new Date().getTime() - new Date(parseInt(log.id) / 4194304 + 1420070400000).getTime() < 3000) {
        embed.author.name = `${string("logger.GUILD_EDITEDBY", { user: this.tagUser(user) })}`;
        embed.author.icon_url = user.dynamicAvatarURL();
      }

      this.bot.createMessage(channel, { embed: embed });
    }
  }
}
