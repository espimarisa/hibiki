/*
  This logs when a role is created, deleted, or edited.
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
    const channel = await loggingdb.guildlogging(guild, "eventLogging");
    if (guild.channels.has(channel)) return channel;
  };

  // Logs when a role is created
  bot.on("guildRoleCreate", async (guild, role) => {
    const logchannel = await cansend(guild, "guildRoleCreate");
    if (!logchannel) return;
    const embed = {
      color: bot.embed.colour("general"),
      description: `<@&${role.id}> (${role.id})`,
      author: {
        name: `@${role.name} created`,
      },
    };

    // Reads the audit logs
    const logs = await guild.getAuditLogs(1, null, 30).catch(() => {});
    if (logs) {
      const log = logs.entries[0];
      const user = logs.users[0];
      // Adds to the embed
      if (log && new Date().getTime() - new Date(log.id / 4194304 + 1420070400000).getTime() < 3000) {
        embed.author.name = `${format.tag(user)} created a role.`;
        embed.author.icon_url = user.avatarURL;
      }
    }

    bot.createMessage(logchannel, { embed: embed }).catch(() => {});
  });

  // Logs when a role is deleted
  bot.on("guildRoleDelete", async (guild, role) => {
    const logchannel = await cansend(guild, "guildRoleDelete");
    if (!logchannel) return;
    const embed = {
      color: bot.embed.colour("error"),
      description: `**ID:** ${role.id}`,
      author: {
        name: `@${role.name} deleted`,
      },
    };

    // Reads the audit logs
    const logs = await guild.getAuditLogs(1, null, 32).catch(() => {});
    if (logs) {
      const log = logs.entries[0];
      const user = logs.users[0];
      // Adds to the embed
      if (log && new Date().getTime() - new Date(log.id / 4194304 + 1420070400000).getTime() < 3000) {
        embed.author.name = `${format.tag(user)} deleted @${role.name}.`;
        embed.author.icon_url = user.avatarURL;
      }
    }

    bot.createMessage(logchannel, { embed: embed }).catch(() => {});
  });

  // Logs when a role is edited
  bot.on("guildRoleUpdate", async (guild, role, oldrole) => {
    const logchannel = await cansend(guild, "guildRoleUpdate");
    if (!logchannel) return;
    const embed = {
      color: bot.embed.colour("general"),
      fields: [],
      author: {
        name: `@${oldrole.name} edited`,
      },
    };

    // Name difference
    if (role.name !== oldrole.name) {
      embed.fields.push({
        name: "Name",
        value: `${oldrole.name} ➜ ${role.name}`,
      });
    }

    // Colour difference
    if (role.color !== oldrole.color) {
      embed.fields.push({
        name: "Colour",
        value: `${oldrole.color ? `${parseInt(oldrole.color).toString(16)}` : "000000"} ➜ ${role.color ? `${parseInt(role.color).toString(16)}` : "000000"}`,
      });
      embed.color = role.color;
    }

    // Hoist difference
    if (role.hoist !== undefined && oldrole.hoist !== undefined && role.hoist !== oldrole.hoist) {
      embed.fields.push({
        name: "Visibility",
        value: role.hoist ? "Not Showing Seperately ➜ Showing Separately" : "Showing Separately ➜ Not Showing Seperately",
      });
    }

    // Mentionability difference
    if (role.mentionable !== oldrole.mentionable) {
      embed.fields.push({
        name: "Mentionability",
        value: role.mentionable ? "Unmentionable ➜ Mentionable" : "Mentionable ➜ Unmentionable",
      });
    }

    // Reads the audit logs
    if (!embed.fields.length) return;
    const logs = await guild.getAuditLogs(1, null, 31).catch(() => {});
    if (logs) {
      const log = logs.entries[0];
      const user = logs.users[0];
      // Adds to the embed
      if (log && new Date().getTime() - new Date(log.id / 4194304 + 1420070400000).getTime() < 3000) {
        embed.author.name = `${format.tag(user)} updated @${role.name}.`;
        embed.author.icon_url = user.avatarURL;
      }
    }

    bot.createMessage(logchannel, { embed: embed }).catch(() => {});
  });
};
