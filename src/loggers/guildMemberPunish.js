/**
 * @fileoverview Guild member punish logger
 * @description Logs when a member is banned, unbanned, or kicked thru the client
 * @module logger/guildMemberPunish
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

  // Logs when a member is banned
  bot.on("guildBanAdd", async (guild, user) => {
    const channel = await canSend(guild, "guildBanAdd");
    if (!channel) return;
    // Reads audit logs
    const logs = await guild.getAuditLogs(1, null, 22).catch(() => {});
    if (!logs) return;
    // Finds users
    const banner = logs.users.find(u => u.id !== user.id);
    const embed = {
      color: bot.embed.color("error"),
      description: `**ID:** ${user.id}`,
      author: {
        name: `${bot.tag(user)} was banned by ${bot.tag(banner)}.`,
        icon_url: user.avatarURL,
      },
    };
    // Sends the embed
    bot.createMessage(channel, { embed: embed });
  });

  // Logs when a member is unbanned
  bot.on("guildBanRemove", async (guild, user) => {
    const channel = await canSend(guild, "guildBanRemove");
    if (!channel) return;
    // Reads audit logs
    const logs = await guild.getAuditLogs(1, null, 23).catch(() => {});
    if (!logs || !logs.entries[0]) return;
    // Finds users
    const banner = logs.users.find(u => u.id !== user.id);
    const embed = {
      description: `**ID:** ${user.id}`,
      color: bot.embed.color("success"),
      author: {
        name: `${bot.tag(user)} was unbanned by ${bot.tag(banner)}.`,
        icon_url: user.avatarURL,
      },
    };
    // Sends the embed
    bot.createMessage(channel, { embed: embed });
  });

  // Logs when a member is kicked
  bot.on("guildKick", (guild, reason, user, member) => trySend(guild, "guildKick", {
    description: `**Reason:** ${reason} \n **ID:** ${user.id}`,
    color: bot.embed.color("error"),
    author: {
      name: `${bot.tag(user)} kicked ${bot.tag(member)}.`,
      icon_url: user.avatarURL,
    },
  }));
};
