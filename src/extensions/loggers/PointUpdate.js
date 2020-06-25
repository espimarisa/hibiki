/*
  Logs when points are added or removed.
*/

const Logging = require("structures/Logger");
const format = require("utils/format");

module.exports = (bot) => {
  // Logging database
  const loggingdb = new Logging(bot.db);
  const cansend = async (guild) => {
    if (!guild || !guild.channels) return;
    const canlog = await loggingdb.canLog(guild);
    if (!canlog) return;
    // Sets type
    const channel = await loggingdb.guildLogging(guild, "modLogging");
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

  // Logs when a member is given a point
  bot.on("pointAdd", (guild, giver, receiver, id, reason) => trysend(guild, "pointAdd", {
    description: `**Reason:** ${reason} \n **ID:** ${id}`,
    color: bot.embed.color("success"),
    author: {
      name: `${format.tag(giver, true)} gave ${format.tag(receiver)} a point.`,
      icon_url: receiver.avatarURL,
    },
  }));

  // Logs when warnings are removed
  bot.on("pointRemove", (guild, user, ids) => trysend(guild, "pointRemove", {
    description: ids.join(" "),
    color: bot.embed.color("error"),
    author: {
      name: `${format.tag(user, true)} removed points.`,
      icon_url: user.avatarURL,
    },
  }));
};
