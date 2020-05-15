/*
  Logs when a member's roles are updated.
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

  // Logs when a member is verified
  bot.on("memberVerify", (guild, giver, receiver) => trysend(guild, "memberVerify", {
    color: bot.embed.color("success"),
    author: {
      name: `${format.tag(giver, false)} verified ${format.tag(receiver)}.`,
      icon_url: receiver.avatarURL,
    },
  }));

  // Logs when a member is unverified
  bot.on("memberUnverify", (guild, giver, receiver) => trysend(guild, "memberUnverify", {
    color: bot.embed.color("error"),
    author: {
      name: `${format.tag(giver, false)} unverified ${format.tag(receiver)}.`,
      icon_url: receiver.avatarURL,
    },
  }));

  // Logs when a member assigns a role
  bot.on("roleAssign", (guild, member, role) => trysend(guild, "roleAssign", {
    color: bot.embed.color("general"),
    author: {
      name: `${format.tag(member)} self-assigned the ${role.name} role.`,
      icon_url: member.avatarURL,
    },
  }));

  // Logs when a member unassigns a role
  bot.on("roleUnassign", (guild, member, role) => trysend(guild, "roleUnassign", {
    color: bot.embed.color("general"),
    author: {
      name: `${format.tag(member)} unassigned the ${role.name} role.`,
      icon_url: member.avatarURL,
    },
  }));
};
