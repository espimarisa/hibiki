// todo: fix all bugs lol
const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");
// R6S ranks
const ranks = { 1100: "Copper 5", 1200: "Copper 4", 1300: "Copper 3", 1400: "Copper 2", 1500: "Copper 1", 1600: "Bronze 5", 1700: "Bronze 4", 1800: "Bronze 3", 1900: "Bronze 2", 2000: "Bronze 1", 2100: "Silver 5", 2200: "Silver 4", 2300: "Silver 3", 2400: "Silver 2", 2500: "Silver 1", 2600: "Gold 3", 2800: "Gold 2", 3000: "Gold 1", 3200: "Platinum 3", 3600: "Platinum 2", 4000: "Platinum 1", 4400: "Diamond", 5000: "Champions" }

class r6sCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["r6", "r6stats"],
      args: "<username:string> [platform:string]",
      description: "Sends r6s player stats",
      cooldown: 3,
    });
  }

  async run(msg, [username, ...platform]) {
    // Platform
    if (!platform.length) platform = "uplay";
    else if (platform.join(" ").toLowerCase() === "pc") platform = "uplay";
    else platform = platform.join(" ").toLowerCase();
    // Sends temp message
    let emsg = await msg.channel.createMessage(this.bot.embed("🎮 R6S Stats", "Loading..."));
    // Looks for user
    let user = await fetch(`https://r6stats.com/api/player-search/${encodeURI(username)}/${encodeURI(platform)}`).catch(() => {});
    if (!user) return emsg.edit(this.bot.embed("🎮 R6S Stats", "❌ User not found.", "error"));
    if (user.error) emsg.edit(this.bot.embed("❌ Error", "User not found.", "error"));
    user = await user.json();
    user = user[0];
    // Gets user stats
    if (!user.uplay && !platform === "pc") return emsg.edit(this.bot.embed("❌ Error", "No info on that user.", "error"));
    let stats = await fetch(`https://r6stats.com/api/stats/${encodeURI(user.uplay_id)}`);
    stats = await stats.json();

    // Sets the fields
    let fields = [];
    if (user.progressionStats) fields.push({ name: "🥇 Level", value: user.progressionStats.level });
    // Seasonal stats
    user.seasonalStats &&
      fields.push({ name: "🔢 MMR", value: user.seasonalStats.mmr }) &&
      user.genericStats &&
      fields.push({ name: "📈 K/D", value: user.genericStats.kd.toFixed(2) }) &&
      fields.push({ name: "🏆 W/L", value: user.genericStats.wl.toFixed(2) });
    // Kills & HS
    let kills = 0;
    let headshots = 0;
    if (stats && stats.operators) stats.operators.forEach(s => {
      kills += s.kills;
      headshots += s.headshots
    });
    if (kills && headshots) fields.push({ name: "😎 Headshot%", value: `${(headshots * 100 / kills).toFixed(1)}%` });
    // Ranks
    let smallest;
    Object.keys(ranks).forEach(r => {
      if (!smallest) smallest = r;
      if (Math.abs(user.seasonalStats.mmr - r) < smallest) smallest = r;
      console.log(Math.abs(user.seasonalStats.mmr - r));
    });
    fields.push({ name: "📊 Rank", value: ranks[smallest] });

    // Edits the embed
    emsg.edit({
      embed: {
        description: fields.map(f => `${f.name}: ${f.value}`).join("\n"),
        color: this.bot.embed.colour("general"),
        author: {
          name: `R6S stats for ${user.username} on ${platform.replace(/uplay/i, "PC")}`,
          url: `https://r6stats.com/stats/${user.uplay_id}`,
          icon_url: user.avatar_url_256 || user.avatar_url_146 || "",
        },
      },
    });
  }
}

module.exports = r6sCommand;
