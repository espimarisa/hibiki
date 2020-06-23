/*
  Logs when a member joins or leaves.
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
    const channel = await loggingdb.guildlogging(guild, "memberLogging");
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

  // Logs to the leaveJoin channel when a member joins
  bot.on("guildMemberAdd", async function(guild, member) {
    // Invalid member
    if (!member.username || !member.user && !member.user.username) return;
    bot.emit("loggingMemberAdd", guild, member);
    const guildcfg = await bot.db.table("guildcfg").get(guild.id);
    // Re-mutes muted members
    const muted = await bot.db.table("mutecache");
    const mute = muted.find(m => m.member === member.id && m.guild === guild.id);
    if (mute && guildcfg.mutedRole) await member.addRole(guildcfg.mutedRole, "Rejoined after being muted").catch(() => {});
    // If no config
    if (!guildcfg || !guildcfg.leaveJoin) return;
    const leaveJoin = guildcfg.leaveJoin;
    const leavejoinchannel = guild.channels.find(c => c.id === leaveJoin);
    if (!leavejoinchannel) return;
    // Handler for custom join messages
    let joinMessage = `Welcome to **${guild.name}, **${member.username}.`;
    if (guildcfg.joinMessage && guildcfg.joinMessage.length < 2000) {
      joinMessage = guildcfg.joinMessage;
      joinMessage = joinMessage.replace("{member}", `${member.username}`);
      joinMessage = joinMessage.replace("{membercount}", `${guild.memberCount}`);
      joinMessage = joinMessage.replace("{servername}", `${guild.name}`);
    }
    // Sends when a member joined
    leavejoinchannel.createMessage({
      embed: {
        title: "🎉 New Member",
        description: joinMessage,
        color: bot.embed.color("success"),
      },
    }).catch(() => {});
  });

  // Logs to the leaveJoin channel when a member leaves
  bot.on("guildMemberRemove", async function(guild, member) {
    // Invalid member
    if (!member.username || !member.user && !member.user.username) return;
    bot.emit("loggingMemberRemove", guild, member);
    const guildcfg = await bot.db.table("guildcfg").get(guild.id);
    // If no config
    if (!guildcfg || !guildcfg.leaveJoin) return;
    const leaveJoin = guildcfg.leaveJoin;
    const leavejoinchannel = guild.channels.find(c => c.id === leaveJoin);
    if (!leavejoinchannel) return;
    // Handler for custom leave messages
    let leaveMessage = `We'll miss you, ${member.username}.`;
    if (guildcfg.leaveMessage && guildcfg.leaveMessage.length < 2000) {
      leaveMessage = guildcfg.leaveMessage;
      leaveMessage = leaveMessage.replace("{member}", `**${member.username}**`);
      leaveMessage = leaveMessage.replace("{membercount}", `**${guild.memberCount}**`);
      leaveMessage = leaveMessage.replace("{servername}", `**${guild.name}**`);
    }
    // Sends when a member leaves
    leavejoinchannel.createMessage({
      embed: {
        title: "👋 Member Left",
        description: leaveMessage,
        color: bot.embed.color("error"),
      },
    }).catch(() => {});
  });

  // Logs details about a new member
  bot.on("loggingMemberAdd", (guild, member) => trysend(guild, "loggingMemberAdd", {
    color: bot.embed.color("success"),
    timestamp: new Date(),
    author: {
      name: `${format.tag(member, true)} joined`,
      icon_url: member.avatarURL,
    },
    thumbnail: {
      url: member.user ? member.user.dynamicAvatarURL(null, 1024) : member.dynamicAvatarURL(null, 1024),
    },
    fields: [{
      name: "ID",
      value: member.id,
    }, {
      name: "Created",
      value: format.date(member.user.createdAt),
    }, {
      name: "Account Age",
      value: `**${Math.floor((new Date() - member.user.createdAt) / 86400000)}** days old`,
    }],
    footer: {
      icon_url: guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
      text: `${guild.name} now has ${guild.memberCount} members`,
    },
  }));

  // Logs details about a member that left
  bot.on("loggingMemberRemove", (guild, member) => trysend(guild, "loggingMemberRemove", {
    color: bot.embed.color("error"),
    timestamp: new Date(),
    author: {
      name: `${format.tag(member, true)} left`,
      icon_url: member.avatarURL,
    },
    thumbnail: {
      url: member.user ? member.user.dynamicAvatarURL(null, 1024) : member.dynamicAvatarURL(null, 1024),
    },
    fields: [{
      name: "ID",
      value: member.id,
    }, {
      name: "Joined",
      value: format.date(member.joinedAt),
    }, {
      name: "Created",
      value: format.date(member.user.createdAt),
    }, {
      name: "Account Age",
      value: `**${Math.floor((new Date() - member.user.createdAt) / 86400000)}** days old`,
    }],
    footer: {
      icon_url: guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
      text: `${guild.name} now has ${guild.memberCount} members`,
    },
  }));
};
