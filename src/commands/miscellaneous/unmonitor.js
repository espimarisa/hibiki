const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class unmonitorCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["removemonitor", "rmmonitor", "umonitor"],
      args: "[account:string]",
      description: "Stops monitoring a Steam account.",
      cooldown: 3,
    });
  }

  async run(msg, args) {
    // Lists monitored users
    if (!args.length) {
      const monitors = [];
      const steamdb = await this.bot.db.table("steammonitor").run();
      steamdb.forEach(d => d.uid === msg.author.id ? monitors.push(d) : "");
      if (!monitors.length) {
        return this.bot.embed("❌ Error", "You aren't monitoring anyone.", msg, "error");
      } else {
        // Currently monitoring
        return this.bot.embed(
          "🎮 Steam Monitor",
          `You are currently monitoring: ${monitors.length > 0 ? monitors.map(m => `\`${m.uname}\``).join(",") : "Nobody"}`,
          msg,
        );
      }
    }

    let steamid;
    let id;
    if (/^\d+$/.test(args[0])) steamid = args[0];

    // Vanity URL
    if (!steamid) {
      id = await fetch(
        `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${this.bot.key.steam}&vanityurl=${encodeURIComponent(args[0])}`,
      ).then(res => res.json().catch(() => {}));

      if (!id || id.response.success !== 1) return this.bot.embed("❌ Error", "Account not found.", msg, "error");
      steamid = id.response.steamid;
    }

    // Looks for the user
    const db = await this.bot.db.table("steammonitor").run();
    let user = db.find(d => d.id === steamid && d.uid === msg.author.id);
    if (!user) user = db.find(d => d.uname.toLowerCase() === args[0].toLowerCase() && d.uid === msg.author.id);

    if (user) {
      await this.bot.db.table("steammonitor").get(user.id).delete().run();
      this.bot.embed("🎮 Steam Monitor", `Removed **${user.uname}** from the monitoring list.`, msg);
    } else {
      this.bot.embed("❌ Error", "You aren't monitoring that account.", msg, "error");
    }
  }
}

module.exports = unmonitorCommand;
