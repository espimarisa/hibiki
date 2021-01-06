/**
 * @file GuildRoleUpdate Logger
 * @description Logs when a role is created, deleted, or updated
 * @module logger/GuildRoleUpdate
 */

import type { EmbedOptions, Guild, Role } from "eris";
import { convertHex } from "../helpers/embed";
import { Logger } from "../classes/Logger";
import { dateFormat } from "../utils/format";
const TYPE = "eventLogging";

export class GuildRoleUpdate extends Logger {
  events = ["guildRoleCreate", "guildRoleDelete", "guildRoleUpdate"];

  async run(event: string, guild: Guild, role: Role, oldrole: Role) {
    /**
     * Logs role creations
     */

    if (event === "guildRoleCreate") {
      const loggingChannel = await this.getChannel(guild, TYPE, event);
      if (!loggingChannel) return;
      if (role.managed) return;

      const embed = {
        color: convertHex("general"),
        author: {
          icon_url: "",
          name: `The ${role.name} role was created.`,
        },
        fields: [
          {
            name: "Name",
            value: `${role.name || "Unknown"}`,
            inline: false,
          },
          {
            name: "ID",
            value: role.id,
            inline: true,
          },
          {
            name: "Created",
            value: `${dateFormat(role.createdAt) || "Unknown"}`,
            inline: true,
          },
          {
            name: "Permissions",
            value: `${
              Object.keys(role.json)
                .map((p) => `\`${p}\``)
                .join(" ") || "Unknown"
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
          embed.author.name = `${this.tagUser(user)} created a role.`;
          embed.author.icon_url = user?.dynamicAvatarURL();
        }
      }

      this.bot.createMessage(loggingChannel, { embed: embed });
    }

    /**
     * Logs role deletions
     */

    if (event === "guildRoleDelete") {
      const loggingChannel = await this.getChannel(guild, TYPE, event);
      if (!loggingChannel) return;
      if (role.managed) return;

      const embed = {
        color: convertHex("error"),
        author: {
          icon_url: "",
          name: `The ${role.name} role was deleted.`,
        },
        fields: [
          {
            name: "Name",
            value: `${role.name || "Unknown"}`,
            inline: false,
          },
          {
            name: "ID",
            value: role.id,
            inline: true,
          },
          {
            name: "Created",
            value: `${dateFormat(role.createdAt) || "Unknown"}`,
            inline: true,
          },
          {
            name: "Permissions",
            value: `${
              Object.keys(role.json)
                .map((p) => `\`${p}\``)
                .join(" ") || "Unknown"
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
          embed.author.name = `${this.tagUser(user)} deleted a role.`;
          embed.author.icon_url = user?.dynamicAvatarURL();
        }
      }

      this.bot.createMessage(loggingChannel, { embed: embed });
    }

    /**
     * Logs role updates
     */

    if (event === "guildRoleUpdate") {
      const loggingChannel = await this.getChannel(guild, TYPE, event);
      if (!loggingChannel) return;

      const embed = {
        color: convertHex("general"),
        fields: [],
        author: {
          icon_url: "",
          name: `The ${oldrole.name} role was edited.`,
        },
      } as EmbedOptions;

      // Name difference
      if (role.name !== oldrole.name) {
        embed.fields.push({
          name: "Name",
          value: `${oldrole.name || "No name"} ➜ ${role.name || "No name"}`,
        });
      }

      // Color difference
      if (role.color !== oldrole.color) {
        embed.fields.push({
          name: "Color",
          value: `${oldrole.color ? `${oldrole.color.toString(16)}` : "000000"} ➜ ${role.color ? `${role.color.toString(16)}` : "000000"}`,
        });

        embed.color = role.color;
      }

      // Hoist difference
      if (role.hoist && oldrole.hoist && role.hoist !== oldrole.hoist) {
        embed.fields.push({
          name: "Visibility",
          value: role.hoist ? "Not Showing Separately ➜ Showing Separately" : "Showing Separately ➜ Not Showing Seperately",
        });
      }

      // Mentionability difference
      if (role.mentionable !== oldrole.mentionable) {
        embed.fields.push({
          name: "Mentionability",
          value: role.mentionable ? "Unmentionable ➜ Mentionable" : "Mentionable ➜ Unmentionable",
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
          embed.author.name = `${this.tagUser(user)} updated the ${role.name} role.`;
          embed.author.icon_url = user.dynamicAvatarURL();
        }
      }

      this.bot.createMessage(loggingChannel, { embed: embed });
    }
  }
}
