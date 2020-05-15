/*
  Logs when bot functionality is changed.
*/

const Logging = require("../../lib/structures/Logging");
const format = require("../../lib/scripts/Format");

module.exports = (bot) => {
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
  bot.on("setAssignable", (guild, user, role) => trysend(guild, "setAssignable", {
    color: bot.embed.color("general"),
    author: {
      name: `${format.tag(user, false)} made ${role.name} assignable.`,
      icon_url: user.avatarURL,
    },
  }));

  // Logs when a role is set to be assignable
  bot.on("removeAssignable", (guild, user, role) => trysend(guild, "removeAssignable", {
    color: bot.embed.color("general"),
    author: {
      name: `${format.tag(user, false)} made ${role.name} unassignable.`,
      icon_url: user.avatarURL,
    },
  }));

  // Logs when prefix is changed
  bot.on("prefixUpdate", (guild, user, prefix) => trysend(guild, "prefixUpdate", {
    color: bot.embed.color("general"),
    author: {
      name: `Prefix changed to ${prefix} by ${format.tag(user)}.`,
      icon_url: user.avatarURL,
    },
  }));

  // Logs when command disabled
  bot.on("commandDisable", (guild, user, command) => trysend(guild, "commandDisable", {
    color: bot.embed.color("error"),
    author: {
      name: `${format.tag(user)} disabled the ${command} command.`,
      icon_url: user.avatarURL,
    },
  }));

  // Logs when command enabled
  bot.on("commandEnable", (guild, user, command) => trysend(guild, "commandEnable", {
    color: bot.embed.color("success"),
    author: {
      name: `${format.tag(user)} enabled the ${command} command.`,
      icon_url: user.avatarURL,
    },
  }));

  // Logs when category disabled
  bot.on("categoryDisable", (guild, user, category) => trysend(guild, "categoryDisable", {
    color: bot.embed.color("error"),
    author: {
      name: `${format.tag(user)} disabled the ${category} category.`,
      icon_url: user.avatarURL,
    },
  }));

  // Logs when category enabled
  bot.on("categoryEnable", (guild, user, category) => trysend(guild, "categoryEnable", {
    color: bot.embed.color("error"),
    author: {
      name: `${format.tag(user)} disabled the ${category} category.`,
      icon_url: user.avatarURL,
    },
  }));
};
