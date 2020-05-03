/*
  This logs when member's punishments are applied or removed.
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
    // Sets type as modLogging
    const channel = await loggingdb.guildlogging(guild, "modLogging");
    if (guild.channels.has(channel)) return channel;
  };

  // Logs when a member is warned
  bot.on("memberWarn", async (guild, giver, receiver, id, reason) => {
    const channel = await cansend(guild, "memberWarn");
    if (!channel) return;
    bot.createMessage(channel, {
      embed: {
        description: `**Reason:** ${reason} \n **ID:** ${id}`,
        color: bot.embed.colour("error"),
        author: {
          name: `${format.tag(giver, false)} warned ${format.tag(receiver)}.`,
          icon_url: receiver.avatarURL,
        },
      },
    });
  });

  // Logs when warnings are removed
  bot.on("warningRemove", async (guild, user, ids) => {
    const channel = await cansend(guild, "warningRemove");
    if (!channel) return;
    bot.createMessage(channel, {
      embed: {
        description: ids.join(" "),
        color: bot.embed.colour("error"),
        author: {
          name: `${format.tag(user, false)} removed warnings.`,
          icon_url: user.avatarURL,
        },
      },
    });
  });

  // Logs when a member is muted
  bot.on("memberMute", async (guild, giver, receiver, reason) => {
    const channel = await cansend(guild, "memberMute");
    if (!channel) return;
    bot.createMessage(channel, {
      embed: {
        description: `**Reason:** ${reason}`,
        color: bot.embed.colour("error"),
        author: {
          name: `${format.tag(giver, false)} muted ${format.tag(receiver)}.`,
          icon_url: receiver.avatarURL,
        },
      },
    });
  });

  // Logs when a member is unmuted
  bot.on("memberUnmute", async (guild, giver, receiver) => {
    const channel = await cansend(guild, "memberUnmute");
    if (!channel) return;
    bot.createMessage(channel, {
      embed: {
        color: bot.embed.colour("success"),
        author: {
          name: `${format.tag(giver, false)} unmuted ${format.tag(receiver, false)}.`,
          icon_url: receiver.avatarURL,
        },
      },
    });
  });
};
