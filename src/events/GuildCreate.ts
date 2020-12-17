import { Guild } from "eris";
import { HibikiClient } from "classes/Client";
import { Event } from "../classes/Event";
import { version } from "../../package.json";
import config from "../../config.json";
import axios from "axios";

class GuildCreateEvent extends Event {
  events = ["guildCreate"];

  async run(guild: Guild, bot: HibikiClient) {
    // Checks to see if the bot was added to a blacklisted guild
    const blacklist = await bot.db.getBlacklistedGuild(guild.id);
    if (blacklist) {
      bot.log.warn(`Added to blacklisted guild, leaving: ${guild.name} (${guild.id})`);
      return guild.leave();
    }

    bot.log.info(`Added to guild: ${guild.name} (${guild.id})`);

    // DMs the owner the welcome message
    // TODO: Localise this crap
    const owner = bot.users.get(guild.ownerID);
    if (owner && owner.id) {
      const ownerDM = await owner.getDMChannel();
      ownerDM.createMessage({
        embed: {
          title: `✨ I was added to a server you own (${guild.name}).`,
          description:
            `To get a list of commands, run \`${config.prefixes[0]}help\`. \n` +
            `You can configure my options by running \`${config.prefixes[0]}config\` or by using the [web dashboard][${config.homepage}]. \n` +
            `By using ${bot.user.username}, you agree to our [privacy policy][${config.homepage}/privacy/] and Discord's Terms of Service`,
          color: bot.convertHex("general"),
        },
      });
    }

    // Updates stats on top.gg
    if (config.keys.topgg) {
      const body = await axios(`https://top.gg/api/bots/${bot.user.id}/stats`, {
        method: "POST",
        data: JSON.stringify({ server_count: bot.guilds.size, shard_count: bot.shards.size }),
        headers: {
          "cache-control": "no-cache",
          "Content-Type": "application/json",
          "Authorization": config.keys.topgg,
          "User-Agent": `${bot.user.username}/${version}`,
        },
      });

      if (!body || body.data.error) bot.log.error("An error occurred while updating the top.gg stats.");
    }

    // Updates stats on bots.gg
    if (config.keys.dbots) {
      const body = await axios(`https://discord.bots.gg/api/v1/bots/${bot.user.id}/stats`, {
        method: "POST",
        data: JSON.stringify({ guildCount: bot.guilds.size, shardCount: bot.shards.size, shardId: 0 }),
        headers: {
          "Content-Type": "application/json",
          "Authorization": config.keys.dbots,
          "User-Agent": `${bot.user.username}/${version}`,
        },
      });

      // TODO: Add more bot listing sites

      if (!body || body.data.message) bot.log.error("An error occurred while updating the dbots stats.");
    }
  }
}

export default new GuildCreateEvent();
