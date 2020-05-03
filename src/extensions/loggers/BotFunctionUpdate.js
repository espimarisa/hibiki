/*
  This logs when bot functionality is changed.
*/

const Logging = require("../../lib/structures/Logging");
const format = require("../../lib/scripts/Format");

module.exports = async (bot) => {
  // Logging database
  const loggingdb = new Logging(bot.db);
  const cansend = async (guild) => {
    if (!guild || !guild.channels) return;
    const canlog = await loggingdb.canLog(guild);
    if (!canlog) return;
    // Sets type
    const channel = await loggingdb.guildlogging(guild, "modLogging");
    if (guild.channels.has(channel)) return channel;
  };

  // Tries to log
  const trysend = async (guild, event, embed) => {
    const channel = await cansend(guild, event);
    if (channel) {
      bot.createMessage(channel, {
        embed: embed,
      }).catch(() => {});
    }
  };

  // Logs when a role is set to be assignable
  bot.on("setAssignable", async (guild, user, role) => trysend(guild, "setAssignable", {
    color: bot.embed.colour("general"),
    author: {
      name: `${format.tag(user, false)} made ${role.name} assignable.`,
      icon_url: user.avatarURL,
    },
  }));

  // Logs when a role is set to be assignable
  bot.on("removeAssignable", async (guild, user, role) => trysend(guild, "removeAssignable", {
    color: bot.embed.colour("general"),
    author: {
      name: `${format.tag(user, false)} made ${role.name} unassignable.`,
      icon_url: user.avatarURL,
    },
  }));
};
