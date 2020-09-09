/**
 * @fileoverview Point update logger
 * @description Logs when points are added or removed from a member
 * @module logger/pointUpdate
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

  // Logs when a member is given a point
  bot.on("pointAdd", (guild, giver, receiver, id, reason) => trySend(guild, "pointAdd", {
    description: `**Reason:** ${reason} \n **ID:** ${id}`,
    color: bot.embed.color("success"),
    author: {
      name: `${bot.tag(giver)} gave ${bot.tag(receiver)} a point.`,
      icon_url: receiver.avatarURL,
    },
  }));

  // Logs when warnings are removed
  bot.on("pointRemove", (guild, user, ids) => trySend(guild, "pointRemove", {
    description: ids.join(" "),
    color: bot.embed.color("error"),
    author: {
      name: `${bot.tag(user)} removed points.`,
      icon_url: user.avatarURL,
    },
  }));
};
