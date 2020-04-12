const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class r6sCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["r6", "r6stats"],
      args: "<username:string> [platform:string]",
      description: "Sends r6s player stats",
      cooldown: 3,
    });
  }

  async run(msg, args) {
    let platform;
    if (!args[1]) platform = "uplay";
    else if (args[1].toLowerCase() == "pc") platform = "uplay";
    else platform = args[1].toLowerCase();

    let emsg = await msg.channel.createMessage(this.bot.embed("R6S Stats", "Loading..."));

    let user = await fetch(`https://r6stats.com/api/player-search/${encodeURI(username)}/${encodeURI(platform)}`).catch(() => { });
    if (!user) return emsg.edit(this.bot.embed("R6S Stats", "User not found", "error"));
    user = await user.json();

    let stats = await fetch(`https://r6stats.com/api/stats/${user.uplay_id}`);
    stats = await stats.json();

    let fields = [];
    if (stats.progressionStats) fields.push({ name: "Level", value: stats.progressionStats.level });
    stats.seasonalStats &&
      fields.push({ name: "MMR", value: stats.seasonalStats.mmr }) &&
      fields.push({ name: "K/D", value: stats.genericStats.kd.toFixed(2) }) &&
      fields.push({ name: "**W/L**", value: stats.genericStats.wl.toFixed(2) });

    let kills = 0;
    let headshots = 0;
    stats.operators.forEach(s => { killamt += s.kills; headshots += s.headshots });
    kills && headshots &&
      fields.push({ name: "Headshot%", value: `${(headshots * 100 / kills).toFixed(1)}%` });

    emsg.edit({
      embed: {
        author: {
          name: `Stats for ${stats.username} on ${platform.replace(/uplay/i, "PC")}!`,
          url: `https://r6stats.com/stats/${stats.uplay_id}`,
          icon_url: stats.avatar_url_256 || stats.avatar_url_146 || ""
        },
        description: fields.map(f => `**${f.name}**: ${f.value}`).join("\n")
      }
    });
  }
}

module.exports = r6sCommand;
