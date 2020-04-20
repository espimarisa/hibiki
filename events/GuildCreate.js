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
    this.bot.log.info(`Added to server: ${guild.name}`);
    // DMs the server owner
    const odm = this.bot.users.get(guild.ownerID);
    if (odm !== undefined) {
      const odm = await owner.getDMChannel();
      if (odm !== undefined) {
        odm.createMessage(this.bot.embed(`✨ Thanks for inviting me, ${odm.username}.`, `\n To get started, run \`${this.bot.cfg.prefix}help\`.`));
      }
    }

    if (this.bot.key.topgg) {
      // Updates top.gg stats
      const res = await fetch(`https://top.gg/api/bots/${this.bot.key.topgg}/stats`, {
        method: "POST",
        body: JSON.stringify({ server_count: this.bot.guilds.size, shard_count: this.bot.shards.size }),
        headers: { "cache-control": "no-cache", "Content-Type": "application/json", "Authorization": this.bot.key.topgg },
      });
      const body = await res.json();
      if (!body) return this.bot.log.error("An error occured while trying to update the top.gg stats: 404");
      if (body.error) this.bot.log.error(`An error occured while trying to update the top.gg stats: ${body.error}`);
    }
  }
}

module.exports = guildCreate;
