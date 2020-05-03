/*
  This logs when member's punishments are applied or removed.
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

  // Logs when a member is warned
  bot.on("memberWarn", (guild, giver, receiver, id, reason) => trysend(guild, "memberWarn", {
    description: `**Reason:** ${reason} \n **ID:** ${id}`,
    color: bot.embed.colour("error"),
    author: {
      name: `${format.tag(giver, false)} warned ${format.tag(receiver)}.`,
      icon_url: receiver.avatarURL,
    },
  }));

  // Logs when warnings are removed
  bot.on("warningRemove", (guild, user, ids) => trysend(guild, "warningRemove", {
    description: ids.join(" "),
    color: bot.embed.colour("error"),
    author: {
      name: `${format.tag(user, false)} removed warnings.`,
      icon_url: user.avatarURL,
    },
  }));

  // Logs when a member is muted
  bot.on("memberMute", (guild, giver, receiver, reason) => trysend(guild, "memberMute", {
    description: `**Reason:** ${reason}`,
    color: bot.embed.colour("error"),
    author: {
      name: `${format.tag(giver, false)} muted ${format.tag(receiver)}.`,
      icon_url: receiver.avatarURL,
    },
  }));

  // Logs when a member is unmuted
  bot.on("memberUnmute", (guild, giver, receiver) => trysend(guild, "memberUnmute", {
    color: bot.embed.colour("success"),
    author: {
      name: `${format.tag(giver, false)} unmuted ${format.tag(receiver, false)}.`,
      icon_url: receiver.avatarURL,
    },
  }));
};
