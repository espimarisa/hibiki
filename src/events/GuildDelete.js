const Event = require("../structures/Event");
const fetch = require("node-fetch");

class guildDelete extends Event {
  constructor(...args) {
    super(...args, {
      name: "guildDelete",
    });
  }

  async run(guild) {
    this.bot.log.info(`Removed from server: ${guild.name}`);
    // Updates top.gg stats
    if (this.bot.key.topgg) {
      const body = await fetch(`https://top.gg/api/bots/${this.bot.user.id}/stats`, {
        method: "POST",
        body: JSON.stringify({ server_count: this.bot.guilds.size, shard_count: this.bot.shards.size }),
        headers: {
          "cache-control": "no-cache",
          "Content-Type": "application/json",
          "Authorization": this.bot.key.topgg,
          "User-Agent": `${this.bot.user.username}/${this.bot.version}`,
        },
      }).then(res => res.json().catch(() => {}));
      if (!body || body.error) this.bot.log.error("An error occured while updating the top.gg stats.");
    }

    // Updates dbots stats
    if (this.bot.key.dbots) {
      const body = await fetch(`https://discord.bots.gg/api/v1/bots/${this.bot.user.id}/stats`, {
        body: JSON.stringify({ guildCount: this.bot.guilds.size, shardCount: this.bot.shards.size, shardId: 0 }),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": this.bot.key.dbots,
          "User-Agent": `${this.bot.user.username}/${this.bot.version}`,
        },
      }).then(res => res.json().catch(() => {}));
      if (!body || body.message) this.bot.log.error("An error occured while updating the dbots stats.");
    }
  }
}

module.exports = guildDelete;
