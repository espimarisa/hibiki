const Command = require("structures/Command");
const fetch = require("node-fetch");

class steammonitorCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["monitor", "monitorsteam"],
      args: "[account:string]",
      description: "Monitors a Steam account for future bans.",
      cooldown: 3,
    });
  }

  async run(msg, args) {
    // List of users monitored
    const monitors = [];
    const steamdb = await this.bot.db.table("steammonitor");
    steamdb.forEach(d => d.uid === msg.author.id ? monitors.push(d) : "");
    if (!args.length) return msg.channel.createMessage(this.bot.embed("🎮 Steam Monitor", `Currently monitoring: ${monitors.length > 0 ? monitors.map(m => `\`${m.uname}\``).join(",") : "Nobody"}`));

    let steamid;
    let id;
    let profile;
    let ban;
    if (/^\d+$/.test(args[0])) steamid = args[0];

    if (!steamid) {
      id = await fetch(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${this.bot.key.steam}&vanityurl=${encodeURIComponent(args[0])}`)
        .then(async res => await res.json().catch(() => {}));
      if (!id || id.response.success !== 1) {
        return msg.channel.createMessage(this.bot.embed("❌ Error", "Account not found.", "error"));
      }
      steamid = id.response.steamid;
    }

    profile = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${this.bot.key.steam}&steamids=${steamid}`)
      .then(async res => await res.json().catch(() => {}));
    profile = profile.response.players[0];

    if (!profile || profile.personaname === "undefined") {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "Account not found.", "error"));
    }

    const construct = {
      id: steamid,
      uid: msg.author.id,
      pfp: profile.avatarfull,
      uname: profile.personaname,
      date: new Date(),
    };

    // Inserts the info
    const db = await this.bot.db.table("steammonitor");
    let acccount = 0;

    // Updates db
    db.forEach(d => {
      if (d.uid === msg.author.id) acccount++;
    });

    // Only 3 accounts can be monitored at a time
    if (acccount >= 3) return msg.channel.createMessage(this.bot.embed("❌ Error", "You can only monitor 3 accounts at a time.", "error"));
    if (!db.find(d => d.id === steamid)) {
      ban = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${this.bot.key.steam}&steamids=${steamid}`)
        .then(async res => await res.json().catch(() => {}));
      ban = ban.players[0];

      // If already banned
      if (ban.VACBanned || ban.NumberOfGameBans > 0) {
        return msg.channel.createMessage(this.bot.embed("❌ Error", `**${profile.personaname}** has already been **${ban.VACBanned ? "VAC" : "game"} banned**.`, "error"));
      }

      // Updates db
      await this.bot.db.table("steammonitor").insert(construct);
      msg.channel.createMessage(this.bot.embed("🎮 Steam Monitor", `Monitoring **${profile.personaname}** for the next 3 days (checking every hour).`));
    } else {
      // Sends if already monitored
      msg.channel.createMessage(this.bot.embed("❌ Error", `**${profile.personaname}** is already being monitored.`, "error"));
    }
  }
}

module.exports = steammonitorCommand;
