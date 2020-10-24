/**
 * @fileoverview Bot function update logger
 * @description Logs when assignable roles are changed, commands are changed, or when the prefix is changed
 * @module logger/botFunctionUpdate
 */

const Logger = require("../structures/Logger");

module.exports = bot => {
  // Logging database
  const loggingdb = new Logger(bot.db);
  const canSend = async guild => {
    if (!guild || !guild.channels) return;
    const canLog = await loggingdb.canLog(guild);
    if (!canLog) return;
    // Sets type
    const channel = await loggingdb.guildLogging(guild, "modLogging");
    if (guild.channels.has(channel)) return channel;
  };

  // Tries to log
  const trySend = async (guild, event, embed) => {
    const channel = await canSend(guild, event);
    if (channel) {
      bot.createMessage(channel, {
        embed: embed,
      }).catch(() => {});
    }
  };

  // Logs when a role is set to be assignable
  bot.on("setAssignable", (guild, user, role) => trySend(guild, "setAssignable", {
    color: bot.embed.color("general"),
    author: {
      name: `${bot.tag(user)} made ${role.name} assignable.`,
      icon_url: user.avatarURL,
    },
  }));

  // Logs when a role is set to be assignable
  bot.on("removeAssignable", (guild, user, role) => trySend(guild, "removeAssignable", {
    color: bot.embed.color("general"),
    author: {
      name: `${bot.tag(user)} made ${role.name} unassignable.`,
      icon_url: user.avatarURL,
    },
  }));

  // Logs when prefix is changed
  bot.on("prefixUpdate", (guild, user, prefix) => trySend(guild, "prefixUpdate", {
    color: bot.embed.color("general"),
    author: {
      name: `Prefix changed to ${prefix} by ${bot.tag(user)}.`,
      icon_url: user.avatarURL,
    },
  }));

  // Logs when command disabled
  bot.on("commandDisable", (guild, user, command) => trySend(guild, "commandDisable", {
    color: bot.embed.color("error"),
    author: {
      name: `${bot.tag(user)} disabled the ${command} command.`,
      icon_url: user.avatarURL,
    },
  }));

  // Logs when command enabled
  bot.on("commandEnable", (guild, user, command) => trySend(guild, "commandEnable", {
    color: bot.embed.color("success"),
    author: {
      name: `${bot.tag(user)} enabled the ${command} command.`,
      icon_url: user.avatarURL,
    },
  }));

  // Logs when category disabled
  bot.on("categoryDisable", (guild, user, category) => trySend(guild, "categoryDisable", {
    color: bot.embed.color("error"),
    author: {
      name: `${bot.tag(user)} disabled the ${category} category.`,
      icon_url: user.avatarURL,
    },
  }));

  // Logs when category enabled
  bot.on("categoryEnable", (guild, user, category) => trySend(guild, "categoryEnable", {
    color: bot.embed.color("error"),
    author: {
      name: `${bot.tag(user)} disabled the ${category} category.`,
      icon_url: user.avatarURL,
    },
  }));
};
