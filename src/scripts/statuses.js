/**
 * @fileoverview Status switcher
 * @description Formats & switches playing statuses
 */

module.exports.switch = (bot) => {
  const statuses = bot.config.statuses.map(s => {
    if (s === "help") s = `${bot.config.prefixes[0]}help | hibiki.app`;
    if (s === "guilds") s = `${bot.guilds.size} servers`;
    if (s === "users") s = `${bot.users.size} users`;
    if (s === "version") s = `v${bot.version} | hibiki.app`;
    return s;
  });

  // Sets initial status
  bot.editStatus(bot.config.status, {
    name: statuses[Math.floor(statuses.length * Math.random())],
    type: bot.config.statustype,
    url: bot.config.statusurl,
  });

  // Switches between statuses
  setInterval(() => {
    bot.editStatus(bot.config.status, {
      name: statuses[Math.floor(statuses.length * Math.random())],
      type: bot.config.statustype,
      url: bot.config.statusurl,
    });
  }, 50000);
};
