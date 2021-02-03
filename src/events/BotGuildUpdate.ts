/**
 * @file BotGuildUpdate
 * @description Handles guildCreate and guildDelete events and their logging
 */

import type { Guild } from "eris";
import { Event } from "../classes/Event";
import { defaultAvatar } from "../helpers/constants";
import { dateFormat, regionFormat } from "../utils/format";
import axios from "axios";

export class BotGuildUpdateEvent extends Event {
  events = ["guildCreate", "guildDelete"];

  async run(event: string, guild: Guild) {
    if (event === "guildCreate") {
      if (!guild) return;
      // Checks to see if the bot was added to a blacklisted guild
      const blacklist = await this.bot.db.getBlacklistedGuild(guild.id);
      if (blacklist) {
        this.bot.log.warn(`Added to blacklisted guild, leaving: ${guild.name} (${guild.id})`);
        return guild.leave();
      }

      // DMs the owner their welcome message
      const owner = this.bot.users.get(guild.ownerID);
      if (owner?.id) {
        const ownerDM = await owner.getDMChannel();
        ownerDM.createMessage({
          embed: {
            title: `✨ I was added to a server you own (${guild.name}).`,
            description:
              `To get a list of commands, run \`${this.bot.config.prefixes[0]}help\`. \n` +
              `You can configure my options by running \`${this.bot.config.prefixes[0]}config\` or by using the [web dashboard](${this.bot.config.homepage}). \n` +
              `By using ${this.bot.user.username}, you agree to our [privacy policy](${this.bot.config.homepage}/privacy/) and Discord's Terms of Service`,
            color: this.convertHex("general"),
          },
        });
      }
    }

    // Logs when added or removed to a guild
    const guildCreate = event === "guildCreate";
    this.bot.log.info(`${guildCreate ? "Added to" : "Removed from"} guild: ${guild.name} (${guild.id})`);
    if (this.bot.config.logchannel) {
      const botCount = guild.botCount;
      const owner = this.bot.users.get(guild.ownerID);
      this.bot.createMessage(this.bot.config.logchannel, {
        embed: {
          color: this.convertHex(guildCreate ? "success" : "error"),
          fields: [
            {
              name: "ID",
              value: guild.id,
            },
            {
              name: "Created",
              value: dateFormat(guild.createdAt),
            },
            {
              name: "Owner",
              value: `${this.tagUser(owner) || owner.id} (${owner.id})`,
            },
            {
              name: "Members",
              value: `${guild.memberCount - botCount} members, ${botCount} bots`,
              inline: true,
            },
            {
              name: "Region",
              value: regionFormat(guild.region),
              inline: true,
            },
          ],
          author: {
            name: `${guildCreate ? "Added to" : "Removed from"} ${guild.name}`,
            icon_url: `${guild.dynamicIconURL() ?? defaultAvatar}`,
          },
          thumbnail: {
            url: `${guild.dynamicIconURL() ?? defaultAvatar}`,
          },
          footer: {
            text: `${this.bot.user.username} is now in ${this.bot.guilds.size} guilds.`,
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
