/**
 * @fileoverview Punish update logger
 * @description Logs when a member is warned or muted
 * @module logger/punishUpdate
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

  // Logs when a member is warned
  bot.on("memberWarn", (guild, giver, receiver, id, reason) => trySend(guild, "memberWarn", {
    description: `**Reason:** ${reason} \n **ID:** ${id}`,
    color: bot.embed.color("error"),
    author: {
      name: `${bot.tag(giver)} warned ${bot.tag(receiver)}.`,
      icon_url: receiver.avatarURL,
    },
  }));

  // Logs when warnings are removed
  bot.on("warningRemove", (guild, user, ids) => trySend(guild, "warningRemove", {
    description: ids.join(" "),
    color: bot.embed.color("error"),
    author: {
      name: `${bot.tag(user)} removed warnings.`,
      icon_url: user.avatarURL,
    },
  }));

  // Logs when a member is muted
  bot.on("memberMute", (guild, giver, receiver, reason) => trySend(guild, "memberMute", {
    description: `**Reason:** ${reason}`,
    color: bot.embed.color("error"),
    author: {
      name: `${bot.tag(giver)} muted ${bot.tag(receiver)}.`,
      icon_url: receiver.avatarURL,
    },
  }));

  // Logs when a member is unmuted
  bot.on("memberUnmute", (guild, giver, receiver) => trySend(guild, "memberUnmute", {
    color: bot.embed.color("success"),
    author: {
      name: `${bot.tag(giver)} unmuted ${bot.tag(receiver)}.`,
      icon_url: receiver.avatarURL,
    },
  }));

  // Logs when a member is muted due to automod
  bot.on("automodMute", (guild, member, msgs) => trySend(guild, "automodMute", {
    color: bot.embed.color("error"),
    description: `Cause of mute:\n${msgs.map(m => `**${member.username}:** ${m.content.substring(0, 128)}`).join("\n")}`,
    author: {
      name: `${bot.tag(member)} was automatically muted.`,
      icon_url: member.avatarURL,
    },
  }));

  // Logs automod invites
  bot.on("automodantiInvite", (guild, member, content, warning) => trySend(guild, "automodantiInvite", {
    color: bot.embed.color("error"),
    author: {
      name: `${bot.tag(member)} tried to send an invite.`,
      icon_url: member.avatarURL,
    },
    fields: [{
      name: "Content",
      value: (content.length > 100 ? `${content.substring(0, 100)}..` : content) || "No content",
      inline: false,
    }, {
      name: "Warning ID",
      value: warning ? warning : "No warning",
      inline: false,
    }],
  }));
};
