/*
  This updates the bot stats on top.gg
  when the bot is added to a server.
*/

const Event = require("../lib/structures/Event");
const fetch = require("node-fetch");

class guildCreate extends Event {
  constructor(...args) {
    super(...args, {
      name: "guildCreate",
    });
  }

  async run(guild) {
    this.bot.log.info(`Added to server: ${guild.name}`)
    // DMs the server owner
    let owner = this.bot.users.get(guild.ownerID);
    if (owner != undefined) {
      let ownerdm = await owner.getDMChannel();
      if (ownerdm != undefined) ownerdm.createMessage(this.bot.embed(`👋 Hey, ${owner.username}, I was added to a server you own.`, `I'm **${this.bot.user.username}**, the ultimate all-in-one Discord bot.  \n To get started, type \`${this.bot.cfg.prefix}help\`. To configure me, you can use the [dashboard](${this.bot.cfg.homepage}/login/).`, "general"));
    }

    if (this.bot.key.topgg) {
      // Updates top.gg stats
      const res = await fetch(`https://top.gg/api/bots/${this.bot.key.topgg}/stats`, {
        method: "POST",
        body: JSON.stringify({ server_count: this.bot.guilds.size, shard_count: this.bot.shards.size }),
        headers: { "cache-control": "no-cache", "Content-Type": "application/json", "Authorization": this.bot.key.topgg, },
      });
      let body = await res.json().catch(() => {});
      if (!body) return this.bot.log.error("An error occured while trying to update the top.gg stats: 404");
      if (body.error) this.bot.log.error(`An error occured while trying to update the top.gg stats: ${body.error}`);
    }
  }
}

module.exports = guildCreate;
