/**
 * @file GuildRoleUpdate Logger
 * @description Logs when a role is created, deleted, or updated
 * @module logger/GuildRoleUpdate
 */

import type { EmbedOptions, Guild, Role } from "eris";
import { convertHex } from "../helpers/embed";
import { Logger } from "../classes/Logger";
import { dateFormat } from "../utils/format";
import config from "../../config.json";
const TYPE = "eventLogging";

export class GuildRoleUpdate extends Logger {
  events = ["guildRoleCreate", "guildRoleDelete", "guildRoleUpdate"];

  async run(event: string, guild: Guild, role: Role, oldrole: Role) {
    /**
     * Logs role creations
     */

    if (event === "guildRoleCreate") {
      if (role.managed) return;
      const guildconfig = await this.bot.db.getGuildConfig(guild.id);
      const loggingChannel = await this.getChannel(guild, TYPE, event, guildconfig);
      if (!loggingChannel) return;
      const string = this.bot.localeSystem.getLocaleFunction(guildconfig?.locale ? guildconfig?.locale : config.defaultLocale);

      const embed = {
        color: convertHex("general"),
        author: {
          icon_url: this.bot.user.dynamicAvatarURL(),
          name: string("logger.ROLE_CREATED", { role: role.name }),
        },
        fields: [
          {
            name: string("global.NAME"),
            value: `${role.name || string("global.UNKNOWN")}`,
            inline: false,
          },
          {
            name: string("global.ID"),
            value: role.id,
            inline: true,
          },
          {
            name: string("global.CREATED"),
            value: `${dateFormat(role.createdAt) || string("global.UNKNOWN")}`,
            inline: true,
          },
          {
            name: string("global.PERMISSIONS"),
            value: `${
              Object.keys(role.json)
                .map((p) => `\`${p}\``)
                .join(" ") || string("global.UNKNOWN")
            }`,
          },
        ],
      } as EmbedOptions;

      // Reads the audit logs
      const logs = await guild.getAuditLogs(1, null, 30).catch(() => {});
      if (logs) {
        const log = logs?.entries?.[0];
        const user = logs?.users?.[0];

        // Adds log info to the embed
        if (log && new Date().getTime() - new Date(parseInt(log.id) / 4194304 + 1420070400000).getTime() < 3000) {
          embed.author.name = string("logger.ROLE_CREATEDBY", { user: this.tagUser(user) });
          embed.author.icon_url = user?.dynamicAvatarURL();
        }
      }

      this.bot.createMessage(loggingChannel, { embed: embed });
    }

    /**
     * Logs role deletions
     */

    if (event === "guildRoleDelete") {
      if (role.managed) return;
      const guildconfig = await this.bot.db.getGuildConfig(guild.id);
      const loggingChannel = await this.getChannel(guild, TYPE, event, guildconfig);
      if (!loggingChannel) return;
      const string = this.bot.localeSystem.getLocaleFunction(guildconfig?.locale ? guildconfig?.locale : config.defaultLocale);

      const embed = {
        color: convertHex("error"),
        author: {
          icon_url: this.bot.user.dynamicAvatarURL(),
          name: string("logger.ROLE_DELETED", { role: role.name }),
        },
        fields: [
          {
            name: string("global.NAME"),
            value: `${role.name || string("global.UNKNOWN")}`,
            inline: false,
          },
          {
            name: string("global.ID"),
            value: role.id,
            inline: true,
          },
          {
            name: string("global.CREATED"),
            value: `${dateFormat(role.createdAt) || string("global.UNKNOWN")}`,
            inline: true,
          },
          {
            name: string("global.PERMISSIONS"),
            value: `${
              Object.keys(role.json)
                .map((p) => `\`${p}\``)
                .join(" ") || string("global.UNKNOWN")
            }`,
          },
        ],
      } as EmbedOptions;

      // Reads the audit logs
      const logs = await guild.getAuditLogs(1, null, 32).catch(() => {});
      if (logs) {
        const log = logs?.entries?.[0];
        const user = logs?.users?.[0];

        // Adds log info to the embed
        if (log && new Date().getTime() - new Date(parseInt(log.id) / 4194304 + 1420070400000).getTime() < 3000) {
          embed.author.name = string("logger.ROLE_DELETEDBY", { user: this.tagUser(user) });
          embed.author.icon_url = user?.dynamicAvatarURL();
        }
      }

      this.bot.createMessage(loggingChannel, { embed: embed });
    }

    /**
     * Logs role updates
     */

    if (event === "guildRoleUpdate") {
      const guildconfig = await this.bot.db.getGuildConfig(guild.id);
      const loggingChannel = await this.getChannel(guild, TYPE, event, guildconfig);
      if (!loggingChannel) return;
      const string = this.bot.localeSystem.getLocaleFunction(guildconfig?.locale ? guildconfig?.locale : config.defaultLocale);

      const embed = {
        color: convertHex("general"),
        fields: [],
        author: {
          icon_url: this.bot.user.dynamicAvatarURL(),
          name: string("logger.ROLE_EDITED", { role: oldrole.name }),
        },
      } as EmbedOptions;

      // Name difference
      if (role.name !== oldrole.name) {
        embed.fields.push({
          name: string("global.NAME"),
          value: `${oldrole.name || string("global.NONE")} ➜ ${role.name || string("global.NONE")}`,
        });
      }

      // Color difference
      if (role.color !== oldrole.color) {
        embed.fields.push({
          name: string("global.COLOR"),
          value: `${oldrole.color ? `${oldrole.color.toString(16)}` : "000000"} ➜ ${role.color ? `${role.color.toString(16)}` : "000000"}`,
        });

        embed.color = role.color;
      }

      // Hoist difference
      if (role.hoist && oldrole.hoist && role.hoist !== oldrole.hoist) {
        embed.fields.push({
          name: string("logger.VISIBILITY"),
          value: role.hoist
            ? `${string("logger.NOT_SHOWING_SEPARATELY")} ➜ ${string("logger.SHOWING_SEPARATELY")}`
            : `${string("logger.SHOWING_SEPARATELY")} ➜ ${string("logger.NOT_SHOWING_SEPARATELY")}`,
        });
      }

      // Mentionability difference
      if (role.mentionable !== oldrole.mentionable) {
        embed.fields.push({
          name: string("logger.MENTIONABILITY"),
          value: role.mentionable
            ? `${string("logger.UNMENTIONABLE")} ➜ ${string("logger.MENTIONABLE")}`
            : `${string("logger.MENTIONABLE")} ➜ ${string("logger.UNMENTIONABLE")}`,
        });
      }

      // Reads the audit logs
      if (!embed.fields.length) return;
      const logs = await guild.getAuditLogs(1, null, 31).catch(() => {});
      if (logs) {
        const log = logs?.entries?.[0];
        const user = logs?.users?.[0];

        // Adds log info to the embed
        if (log && new Date().getTime() - new Date(parseInt(log.id) / 4194304 + 1420070400000).getTime() < 3000) {
          embed.author.name = string("logger.ROLE_EDITEDBY", { user: this.tagUser(user), role: oldrole.name });
          embed.author.icon_url = user.dynamicAvatarURL();
        }
      }

      this.bot.createMessage(loggingChannel, { embed: embed });
    }
  }
}
