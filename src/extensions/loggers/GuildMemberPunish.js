/*
  Logs when a member is kicked, banned, or unbanned.
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

  // Logs when a member is banned
  bot.on("guildBanAdd", async (guild, user) => {
    const channel = await cansend(guild, "guildBanAdd");
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
        name: `${format.tag(user, true)} was banned by ${format.tag(banner, true)}.`,
        icon_url: user.avatarURL,
      },
    };
    // Sends the embed
    bot.createMessage(channel, { embed: embed });
  });

  // Logs when a member is unbanned
  bot.on("guildBanRemove", async (guild, user) => {
    const channel = await cansend(guild, "guildBanRemove");
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
        name: `${format.tag(user, true)} was unbanned by ${format.tag(banner, true)}.`,
        icon_url: user.avatarURL,
      },
    };
    // Sends the embed
    bot.createMessage(channel, { embed: embed });
  });

  // Logs when a member is kicked
  bot.on("guildKick", (guild, reason, user, member) => trysend(guild, "guildKick", {
    description: `**Reason:** ${reason} \n **ID:** ${user.id}`,
    color: bot.embed.color("error"),
    author: {
      name: `${format.tag(user, true)} kicked ${format.tag(member, true)}.`,
      icon_url: user.avatarURL,
    },
  }));
};
