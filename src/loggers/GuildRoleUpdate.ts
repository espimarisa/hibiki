/**
 * @file GuildRoleUpdate Logger
 * @description Logs when a role is created, deleted, or modified
 */

import type { Guild, Role } from "eris";
import { convertHex } from "../helpers/embed";
import { Logger } from "../classes/Logger";
const TYPE = "eventLogging";

export class GuildRoleUpdat extends Logger {
  events = ["guildRoleCreate", "guildRoleDelete", "guildRoleUpdate"];

  async run(event: string, guild: Guild, role: Role, oldrole: Role) {
    /** Logs when a role is created */
    if (event === "guildRoleCreate") {
      const loggingChannel = await this.getChannel(guild, TYPE, event);
      if (!loggingChannel) return;

      const embed = {
        color: convertHex("general"),
        description: `<@&${role.id}> (${role.id})`,
        author: {
          icon_url: "",
          name: `@${role.name} created`,
        },
      };

      // Reads the audit logs
      const logs = await guild.getAuditLogs(1, null, 30).catch(() => {});
      if (logs) {
        const log = logs.entries[0];
        const user = logs.users[0];
        // Adds to the embed
        // @ts-expect-error
        if (log && new Date().getTime() - new Date(log.id / 4194304 + 1420070400000).getTime() < 3000) {
          embed.author.name = `${this.tagUser(user)} created a role.`;
          embed.author.icon_url = user.avatarURL;
        }
      }

      this.bot.createMessage(loggingChannel, { embed: embed }).catch(() => {});
    }

    /** Logs when a role is deleted */
    if (event === "guildRoleDelete") {
      const loggingChannel = await this.getChannel(guild, TYPE, event);
      if (!loggingChannel) return;
      const embed = {
        color: convertHex("error"),
        description: `**ID:** ${role.id}`,
        author: {
          icon_url: "",
          name: `@${role.name} deleted`,
        },
      };

      // Reads the audit logs
      const logs = await guild.getAuditLogs(1, null, 32).catch(() => {});
      if (logs) {
        const log = logs.entries[0];
        const user = logs.users[0];
        // Adds to the embed
        // @ts-expect-error
        if (log && new Date().getTime() - new Date(log.id / 4194304 + 1420070400000).getTime() < 3000) {
          embed.author.name = `${this.tagUser(user)} deleted @${role.name}.`;
          embed.author.icon_url = user.avatarURL;
        }
      }

      this.bot.createMessage(loggingChannel, { embed: embed }).catch(() => {});
    }

    /** Logs when a role is updated */
    if (event === "guildRoleUpdate") {
      const loggingChannel = await this.getChannel(guild, TYPE, event);
      if (!loggingChannel) return;

      const embed = {
        color: convertHex("general"),
        // @ts-expect-error
        fields: [],
        author: {
          icon_url: "",
          name: `@${oldrole.name} edited`,
        },
      };

      // Name difference
      if (role.name !== oldrole.name) {
        embed.fields.push({
          name: "Name",
          value: `${oldrole.name} ➜ ${role.name}`,
        });
      }

      // Color difference
      if (role.color !== oldrole.color) {
        embed.fields.push({
          name: "Color",
          // @ts-expect-error
          value: `${oldrole.color ? `${parseInt(oldrole.color).toString(16)}` : "000000"} ➜ ${
            // @ts-expect-error
            role.color ? `${parseInt(role.color).toString(16)}` : "000000"
          }`,
        });
        embed.color = role.color;
      }

      // Hoist difference
      if (role.hoist !== undefined && oldrole.hoist !== undefined && role.hoist !== oldrole.hoist) {
        embed.fields.push({
          name: "Visibility",
          value: role.hoist ? "Not Showing Seperately ➜ Showing Separately" : "Showing Separately ➜ Not Showing Seperately",
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
        const log = logs.entries[0];
        const user = logs.users[0];
        // Adds to the embed
        // @ts-expect-error
        if (log && new Date().getTime() - new Date(log.id / 4194304 + 1420070400000).getTime() < 3000) {
          embed.author.name = `${this.tagUser(user)} updated @${role.name}.`;
          embed.author.icon_url = user.avatarURL;
        }
      }
    }
  }
}
