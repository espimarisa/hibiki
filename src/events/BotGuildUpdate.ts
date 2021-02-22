/**
 * @file BotGuildUpdate
 * @description Handles guildCreate and guildDelete events and their logging
 */

import type { Guild } from "eris";
import { Event } from "../classes/Event";
import { defaultAvatar } from "../helpers/constants";
import { dateFormat, regionFormat } from "../utils/format";
import { getRESTUser } from "../utils/getRESTUser";
import axios from "axios";

export class BotGuildUpdateEvent extends Event {
  events = ["guildCreate", "guildDelete"];

  async run(event: string, guild: Guild) {
    if (event === "guildCreate") {
      if (!guild) return;
      // Checks to see if the bot was added to a blacklisted guild
      const blacklist = await this.bot.db.getBlacklistedGuild(guild.id);
      if (blacklist?.length) {
        this.bot.log.warn(`Added to blacklisted guild, leaving: ${guild.name} (${guild.id})`);
        return guild.leave();
      }

      // Looks to see if the guild already has a config
      const db = await this.bot.db.getGuildConfig(guild.id);

      // Caches invites
      if (this.bot.config.inviteLogs === true && db?.inviteOptOut !== true) {
        const invites = await guild.getInvites().catch(() => {});
        if (invites) this.bot.inviteHandler.inviteCache[guild.id] = invites;
      }

      // DMs the owner their welcome message
      const owner = this.bot.users.get(guild.ownerID);
      if (owner?.id) {
        const ownerDM = await owner.getDMChannel().catch(() => {});
        if (ownerDM) {
          // Gets owners's locale
          const ownerLocale = await this.bot.localeSystem.getUserLocale(owner.id, this.bot);
          const string = this.bot.localeSystem.getLocaleFunction(ownerLocale || this.bot.config.defaultLocale);
          const prefix = db?.prefix ? db.prefix : this.bot.config.prefixes[0];

          // Gets strings
          const ADDED_TITLE = string("global.BOTADDED_TITLE", { guild: guild.name });
          const ADDED_TAGLINE = string("global.BOTADDED_TAGLINE", { username: this.bot.user.username });
          const ADDED_PRIVACY = string("global.BOTADDED_PRIVACY");
          const ADDED_HELP = string("global.BOTADDED_HELP", { prefix: prefix });
          const ADDED_CMD = string("global.BOTADDED_DISABLECMD", { prefix: prefix });
          const ADDED_CATEGORY = string("global.BOTADDED_DISABLECATEGORY", { prefix: prefix });
          const ADDED_PROFILE = string("global.BOTADDED_PROFILE", { prefix: prefix });
          const ADDED_MODULES = string("global.BOTADDED_MODULES", { prefix: prefix });
          const ADDED_DASHBOARD = string("global.BOTADDED_DASHBOARD", { homepage: this.bot.config.homepage });
          const ADDED_SUPPORT = string("global.BOTADDED_SUPPORT");

          const ADDED_DESCRIPTION =
            `${ADDED_TAGLINE}\n${ADDED_PRIVACY}` +
            `\n\n${ADDED_HELP}` +
            `\n${ADDED_CMD}\n${ADDED_CATEGORY}\n${ADDED_PROFILE}` +
            `\n\n${ADDED_MODULES}\n${ADDED_DASHBOARD}` +
            `\n\n${ADDED_SUPPORT}`;

          await ownerDM.createMessage({
            embed: {
              title: `✨ ${ADDED_TITLE}`,
              description: ADDED_DESCRIPTION,
              color: this.convertHex("general"),
            },
          });
        }
      }
    }

    // Logs when added or removed to a guild
    const guildCreate = event === "guildCreate";
    this.bot.log.info(`${guildCreate ? "Added to" : "Removed from"} guild: ${guild.name} (${guild.id})`);
    if (this.bot.config.logchannel) {
      let owner = this.bot.users.get(guild.ownerID);
      if (!owner) owner = await getRESTUser(guild.ownerID, this.bot);
      const string = this.bot.localeSystem.getLocaleFunction(this.bot.config.defaultLocale);

      this.bot.createMessage(this.bot.config.logchannel, {
        embed: {
          color: this.convertHex(guildCreate ? "success" : "error"),
          fields: [
            {
              name: string("global.ID"),
              value: guild.id,
            },
            {
              name: string("global.CREATED_AT"),
              value: dateFormat(guild.createdAt),
            },
            {
              name: string("global.OWNER"),
              value: `${this.tagUser(owner) || owner?.id} (${owner?.id})`,
            },
            {
              name: string("global.MEMBERS"),
              value: string("general.SERVER_MEMBERS", { members: guild.memberOnlyCount, bots: guild.botCount }),
              inline: true,
            },
            {
              name: string("global.REGION"),
              value: regionFormat(guild.region),
              inline: true,
            },
          ],
          author: {
            name: string("global.BOTADDED_AUTHOR", { type: guildCreate ? 0 : 1, guild: guild.name }),
            icon_url: `${guild.dynamicIconURL() || defaultAvatar}`,
          },
          thumbnail: {
            url: `${guild.dynamicIconURL() || defaultAvatar}`,
          },
          footer: {
            text: string("global.BOTADDED_FOOTER", { username: this.bot.user.username, amount: this.bot.guilds.size }),
            icon_url: this.bot.user.dynamicAvatarURL(),
          },
        },
      });
    }

    // Updates stats on top.gg
    if (this.bot.config.keys.botlists.topgg) {
      await axios(`https://top.gg/api/bots/${this.bot.user.id}/stats`, {
        method: "POST",
        data: JSON.stringify({ server_count: this.bot.guilds.size, shard_count: this.bot.shards.size }),
        headers: {
          "cache-control": "no-cache",
          "Content-Type": "application/json",
          "Authorization": this.bot.config.keys.botlists.topgg,
          "User-Agent": "hibiki",
        },
      }).catch((err) => {
        return this.bot.log.error(`An error occurred while updating the top.gg stats: ${err}`);
      });
    }

    // Updates stats on bots.gg
    if (this.bot.config.keys.botlists.dbots) {
      await axios(`https://discord.bots.gg/api/v1/bots/${this.bot.user.id}/stats`, {
        method: "POST",
        data: JSON.stringify({ guildCount: this.bot.guilds.size, shardCount: this.bot.shards.size, shardId: 0 }),
        headers: {
          "Content-Type": "application/json",
          "Authorization": this.bot.config.keys.botlists.dbots,
          "User-Agent": "hibiki",
        },
      }).catch((err) => {
        return this.bot.log.error(`An error occurred while updating the bots.gg stats: ${err}`);
      });
    }

    // Updates stats on discord.boats
    if (this.bot.config.keys.botlists.dboats) {
      await axios(`https://discord.boats/api/bot/${this.bot.user.id}`, {
        method: "POST",
        data: JSON.stringify({ server_count: this.bot.guilds.size }),
        headers: {
          Authorization: `${this.bot.config.keys.botlists.dboats}`,
        },
      }).catch((err) => {
        return this.bot.log.error(`An error occurred while updating the discord.boats stats: ${err}`);
      });
    }

    // Updates stats on botsfordiscord.com
    if (this.bot.config.keys.botlists.botsfordiscord) {
      await axios(`https://botsfordiscord.com/api/${this.bot.user.id}`, {
        method: "POST",
        data: JSON.stringify({ server_count: this.bot.guilds.size }),
        headers: {
          "Authorization": `${this.bot.config.keys.botlists.botsfordiscord}`,
          "Content-Type": "application/json",
        },
      }).catch((err) => {
        return this.bot.log.error(`An error occurred while updating the botsfordiscord.com: ${err}`);
      });
    }

    // Updates stats on discordbotlist.com
    if (this.bot.config.keys.botlists.discordbotlist) {
      await axios(`https://discordbotlist.com/api/v1/bots/${this.bot.user.id}/stats`, {
        method: "POST",
        data: JSON.stringify({
          guilds: this.bot.guilds.size,
          users: this.bot.users.size,
          voice_connections: this.bot.voiceConnections.size,
        }),
        headers: {
          Authorization: `${this.bot.config.keys.botlists.discordbotlist}`,
        },
      }).catch((err) => {
        return this.bot.log.error(`An error occurred while updating the discordbotlist.com: ${err}`);
      });
    }

    // Updates stats on botsondiscord.xyz
    if (this.bot.config.keys.botlists.botsondiscord) {
      await axios(`https://bots.ondiscord.xyz/bot-api/bots/${this.bot.user.id}/guilds`, {
        method: "POST",
        data: JSON.stringify({ guildCount: this.bot.guilds.size }),
        headers: {
          "Authorization": `${this.bot.config.keys.botlists.botsondiscord}`,
          "Content-Type": "application/json",
        },
      }).catch((err) => {
        return this.bot.log.error(`An error occurred while updating the bots.ondiscord.xyz stats: ${err}`);
      });
    }
  }
}
