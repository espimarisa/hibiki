import type { Guild } from "eris";
import { Event } from "../classes/Event";
import { convertHex } from "../helpers/embed";
import { version } from "../../package.json";
import config from "../../config.json";
import axios from "axios";

export class GuildCreateEvent extends Event {
  events = ["guildCreate"];

  async run(guild: Guild) {
    // Checks to see if the bot was added to a blacklisted guild
    const blacklist = await this.bot.db.getBlacklistedGuild(guild.id);
    if (blacklist) {
      this.bot.log.warn(`Added to blacklisted guild, leaving: ${guild.name} (${guild.id})`);
      return guild.leave();
    }

    this.bot.log.info(`Added to guild: ${guild.name} (${guild.id})`);

    // DMs the owner the welcome message
    // TODO: Localise this crap
    const owner = this.bot.users.get(guild.ownerID);
    if (owner && owner.id) {
      const ownerDM = await owner.getDMChannel();
      ownerDM.createMessage({
        embed: {
          title: `✨ I was added to a server you own (${guild.name}).`,
          description:
            `To get a list of commands, run \`${config.prefixes[0]}help\`. \n` +
            `You can configure my options by running \`${config.prefixes[0]}config\` or by using the [web dashboard][${config.homepage}]. \n` +
            `By using ${this.bot.user.username}, you agree to our [privacy policy][${config.homepage}/privacy/] and Discord's Terms of Service`,
          color: convertHex("general"),
        },
      });
    }

    // Updates stats on top.gg
    if (config.keys.topgg) {
      const body = await axios(`https://top.gg/api/bots/${this.bot.user.id}/stats`, {
        method: "POST",
        data: JSON.stringify({ server_count: this.bot.guilds.size, shard_count: this.bot.shards.size }),
        headers: {
          "cache-control": "no-cache",
          "Content-Type": "application/json",
          "Authorization": config.keys.topgg,
          "User-Agent": `${this.bot.user.username}/${version}`,
        },
      });

      if (!body || body.data.error) this.bot.log.error("An error occurred while updating the top.gg stats.");
    }

    // Updates stats on bots.gg
    if (config.keys.dbots) {
      const body = await axios(`https://discord.bots.gg/api/v1/bots/${this.bot.user.id}/stats`, {
        method: "POST",
        data: JSON.stringify({ guildCount: this.bot.guilds.size, shardCount: this.bot.shards.size, shardId: 0 }),
        headers: {
          "Content-Type": "application/json",
          "Authorization": config.keys.dbots,
          "User-Agent": `${this.bot.user.username}/${version}`,
        },
      });

      // TODO: Add more bot listing sites

      if (!body || body.data.message) this.bot.log.error("An error occurred while updating the dbots stats.");
    }
  }
}
