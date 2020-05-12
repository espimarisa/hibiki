/*
  This updates the bot stats on top.gg added to a server.
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
    // Checks blacklist
    const blacklist = await this.bot.db.table("blacklist").filter({
      guild: guild.id,
    });

    // If server is blacklisted
    if (blacklist.find(g => g.guild === guild.id)) {
      this.bot.log.warn(`Added to a blacklisted guild: ${guild.name}`),
        await guild.leave();
      return;
    }

    this.bot.log.info(`Added to server: ${guild.name}`);
    // DMs the server owner
    const oid = this.bot.users.get(guild.ownerID).catch(() => {});
    if (oid) {
      const odm = await oid.getDMChannel().catch(() => {});
      if (odm) {
        odm.createMessage(this.bot.embed(`✨ I was added to your server, ${oid.username}.`, `\n To get started, run \`${this.bot.cfg.prefix}help\`. 
        You can configure me using the [web dashboard](${this.bot.cfg.homepage}/dashboard/).`)).catch(() => {});
      }
    }

    if (this.bot.key.topgg) {
      // Updates top.gg stats
      const body = await fetch(`https://top.gg/api/bots/${this.bot.key.topgg}/stats`, {
        method: "POST",
        body: JSON.stringify({ server_count: this.bot.guilds.size, shard_count: this.bot.shards.size }),
        headers: { "cache-control": "no-cache", "Content-Type": "application/json", "Authorization": this.bot.key.topgg },
      }).then(async res => await res.json().catch(() => {}));
      if (!body) return this.bot.log.error("An error occurred while trying to update the top.gg stats: 404");
      if (body.error) this.bot.log.error(`An error occurred while trying to update the top.gg stats: ${body.error}`);
    }
  }
}

module.exports = guildCreate;
