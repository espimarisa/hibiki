/*
  Logs when a guild is updated.
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
    const channel = await loggingdb.guildLogging(guild, "eventLogging");
    if (guild.channels.has(channel)) return channel;
  };

  // Logs when guild is updated
  bot.on("guildUpdate", async (guild, oldguild) => {
    // Finds channel; returns if it shouldn't log
    const logchannel = await cansend(guild, "guildUpdate");
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
        value: `${format.tag(guild.members.find(m => m.id === oldguild.ownerID))} ➜ ${format.tag(guild.members.find(m => m.id === guild.ownerID))}`,
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
        embed.author.name = `${format.tag(user)} updated ${oldguild.name}.`;
        embed.author.icon_url = user.avatarURL;
      }
    }

    bot.createMessage(logchannel, { embed: embed }).catch(() => {});
  });
};
