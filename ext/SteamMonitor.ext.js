const fetch = require("node-fetch");

// Checks every hour
module.exports = async (bot) => {
  if (!bot.key.steam) return;
  setInterval(async () => {
    let bans = [];
    const ids = [];
    const monitoring = await bot.db.table("steammonitor");

    // If it's more than 3 days old
    monitoring.forEach(async m => {
      if (new Date() - new Date(m.date) > 259200000) {
        return await bot.db.table("monitoring").get(m.id).delete();
      }
      ids.push(m.id);
    });

    if (ids.length > 0) {
      // Fetches the API
      body = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${bot.key.steam}&steamids=${ids.join(",")}`)
        .then(async res => await res.json().catch(() => {}));
      if (bans) bans = bans.players;
    } else return;

    if (!bans) return;

    // Gets # of bans; types
    bans.forEach(async b => {
      if (b.VACBanned || b.NumberOfGameBans > 0) {
        // Finds the user who was banned
        const user = await monitoring.find(d => d.id === b.SteamID);
        await bot.db.table("monitoring").get(b.SteamID).delete();
        // Tries to DM the monitorer
        bot.users.find(u => user.uid === u.id).getDMChannel()
          .then(async dm => {
            await dm.createMessage({
              embed: {
                title: "🎮 Steam Monitor",
                color: bot.embed.color("error"),
                author: {
                  name: `${user.uname} (${user.id}) has been${b.VACBanned ? "VAC" : "game"} banned.`,
                  icon_url: user.pfp,
                },
              },
            }).catch(() => {});
          });
      }
    });
  }, 3600000);
};
