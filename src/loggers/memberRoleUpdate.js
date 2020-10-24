/**
 * @fileoverview Member role update logger
 * @description Logs when a member is verified, unverified, or assigns/unassigns a role.
 * @module logger/memberRoleUpdate
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

  // Logs when a member is verified
  bot.on("memberVerify", (guild, giver, receiver) => trySend(guild, "memberVerify", {
    color: bot.embed.color("success"),
    author: {
      name: `${bot.tag(giver)} verified ${bot.tag(receiver)}.`,
      icon_url: receiver.avatarURL,
    },
  }));

  // Logs when a member is unverified
  bot.on("memberUnverify", (guild, giver, receiver) => trySend(guild, "memberUnverify", {
    color: bot.embed.color("error"),
    author: {
      name: `${bot.tag(giver)} unverified ${bot.tag(receiver)}.`,
      icon_url: receiver.avatarURL,
    },
  }));

  // Logs when a member assigns a role
  bot.on("roleAssign", (guild, member, role) => trySend(guild, "roleAssign", {
    color: bot.embed.color("general"),
    author: {
      name: `${bot.tag(member)} self-assigned the ${role.name} role.`,
      icon_url: member.avatarURL,
    },
  }));

  // Logs when a member unassigns a role
  bot.on("roleUnassign", (guild, member, role) => trySend(guild, "roleUnassign", {
    color: bot.embed.color("general"),
    author: {
      name: `${bot.tag(member)} unassigned the ${role.name} role.`,
      icon_url: member.avatarURL,
    },
  }));
};
