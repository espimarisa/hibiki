const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class unmonitorCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["removemonitor", "rmmonitor", "unmonitorsteam", "umonitor"],
      args: "[account:string]",
      description: "Stops monitoring a Steam account.",
      cooldown: 3,
    });
  }

  async run(msg, args) {
    // Handler for if no arguments were given
    if (!args[0]) {
      const monitors = [];
      const steamdb = await this.bot.db.table("steammonitor");
      steamdb.forEach(d => d.uid === msg.author.id ? monitors.push(d) : "");
      // Sends an error if the user isnt monitoring anyone
      if (!monitors.length) {
        return msg.channel.createMessage(this.bot.embed("❌ Error", "You aren't monitoring anyone.", "error"));
      } else {
        // Sends a list of currently monitored accounts
        msg.channel.createMessage(this.bot.embed("🎮 Steam Monitor", `You are currently monitoring: ${monitors.length > 0 ? monitors.map(m => `\`${m.uname}\``).join(",") : "Nobody"}`, "general"));
      }
      return;
    }

    let steamid;
    let id;
    // Checks for a numerical value
    if (/^\d+$/.test(args[0])) steamid = args[0];

    // Looks for a custom URL
    if (!steamid) {
      // Fetches the API
      id = await fetch(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${this.bot.key.steam}&vanityurl=${encodeURIComponent(args[0])}`)
        .then(async res => await res.json().catch(() => {}));
      // Sends if user couldn't be found
      if (!id || id.response.success !== 1) {
        return msg.channel.createMessage(this.bot.embed("❌ Error", "Account not found.", "error"));
      }
      steamid = id.response.steamid;
    }

    // Looks for a valid user
    const db = await this.bot.db().table("steammonitor");
    let user = db.find(d => d.id === steamid && d.uid === msg.author.id);
    if (!user) user = db.find(d => d.uname.toLowerCase() === args[0].toLowerCase() && d.uid === msg.author.id);
    if (user) {
      // Deletes data from the DB
      await this.bot.db.table("steammonitor").get(user.id).delete();
      msg.channel.createMessage(this.bot.embed("🎮 Steam Monitor", `Removed **${user.uname}** from the monitoring list.`, "general"));
    } else {
      msg.channel.createMessage(this.bot.embed("❌ Error", "That account isn't being monitored by you.", "error"));
    }
  }
}

module.exports = unmonitorCommand;
