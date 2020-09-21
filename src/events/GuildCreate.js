const Event = require("../structures/Event");
const fetch = require("node-fetch");

class guildCreate extends Event {
  constructor(...args) {
    super(...args, {
      name: "guildCreate",
    });
  }

  async run(guild) {
    const blacklist = await this.bot.db.table("blacklist").filter({
      guild: guild.id,
    }).run();

    // If server is blacklisted
    if (blacklist.find(g => g.guild === guild.id)) {
      this.bot.log.warn(`Added to a blacklisted guild: ${guild.name}`), await guild.leave();
      return;
    }

    // DMs the server owner
    this.bot.log.info(`Added to server: ${guild.name}`);
    const oid = await this.bot.users.get(guild.ownerID);
    if (oid) {
      const odm = await oid.getDMChannel().catch(() => {});
      if (odm) {
        odm.createMessage({
          embed: {
            title: `✨ I was added to your server, ${oid.username}.`,
            description: `\n To get a list of commands, run \`${this.bot.config.prefixes[0]}help\` in your server. \n` +
              `You can also configure my options using the [web dashboard](${this.bot.config.homepage}/manage/servers). \n` +
              `By using ${this.bot.user.username}, you agree to our [privacy policy](${this.bot.config.homepage}/privacy/) and Discord's TOS.`,
            color: this.bot.embed.color("general"),
          },
        }).catch(() => {});
      }
    }

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

module.exports = guildCreate;
