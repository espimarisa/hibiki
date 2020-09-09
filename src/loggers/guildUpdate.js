/**
 * @fileoverview Guild update logger
 * @description Logs when a guild is modified
 * @module logger/guildUpdate
 */

const Logger = require("../structures/Logger");
const format = require("../utils/format");

module.exports = bot => {
  // Logging database
  const loggingdb = new Logger(bot.db);
  const canSend = async guild => {
    if (!guild || !guild.channels) return;
    const canLog = await loggingdb.canLog(guild);
    if (!canLog) return;
    // Sets type
    const channel = await loggingdb.guildLogging(guild, "eventLogging");
    if (guild.channels.has(channel)) return channel;
  };

  // Logs when guild is updated
  bot.on("guildUpdate", async (guild, oldguild) => {
    // Finds channel; returns if it shouldn't log
    const logchannel = await canSend(guild, "guildUpdate");
    if (!logchannel) return;
    const embed = {
      color: bot.embed.color("general"),
      author: {
        name: `${oldguild.name} updated`,
      },
      fields: [],
    };

    // Guild name differences
    if (guild.name !== oldguild.name) {
      embed.fields.push({
        name: "Name",
        value: `${oldguild.name} ➜ ${guild.name}`,
      });
    }

    // Region differences
    if (guild.region !== oldguild.region) {
      embed.fields.push({
        name: "Region",
        value: `${format.region(oldguild.region)} ➜ ${format.region(guild.region)}`,
      });
    }

    // Owner differences
    if (guild.ownerID !== oldguild.ownerID) {
      embed.fields.push({
        name: "Owner",
        value: `${bot.tag(guild.members.find(m => m.id === oldguild.ownerID))} ➜ ${bot.tag(guild.members.find(m => m.id === guild.ownerID))}`,
      });
    }

    // Verification level differences
    if (guild.verificationLevel !== oldguild.verificationLevel) {
      embed.fields.push({
        name: "Verification Level",
        value: `Level ${guild.verificationLevel} ➜ Level ${guild.verificationLevel}`,
      });
    }

    // Reads the audit logs
    if (!embed.fields.length) return;
    const logs = await guild.getAuditLogs(1, null, 1).catch(() => {});
    if (logs) {
      // Updates embed if needed
      const log = logs.entries[0];
      const user = logs.users[0];
      if (log && new Date().getTime() - new Date(log.id / 4194304 + 1420070400000).getTime() < 3000) {
        embed.author.name = `${bot.tag(user)} updated ${oldguild.name}.`;
        embed.author.icon_url = user.avatarURL;
      }
    }

    bot.createMessage(logchannel, { embed: embed }).catch(() => {});
  });
};
