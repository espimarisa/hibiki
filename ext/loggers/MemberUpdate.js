/*
  This logs when a member joins or leaves.
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
    // Sets type as memberLogging
    const channel = await loggingdb.guildlogging(guild, "memberLogging");
    if (guild.channels.has(channel)) return channel;
  };

  // Logs to the leavejoin channel when a member joins
  bot.on("guildMemberAdd", async function(guild, member) {
    // Invalid member
    if (!member.username || !member.user && !member.user.username) return;
    else if (!member.username && member.user && member.user.username) member = member.user;
    bot.emit("loggingMemberAdd", guild, member);
    const guildcfg = await bot.db.table("guildcfg").get(guild.id);
    // Re-mutes muted members
    const muted = await bot.db.table("mutecache");
    const mute = muted.find(m => m.member === member.id && m.guild === guild.id);
    if (mute && guildcfg.muted) await member.addRole(guildcfg.muted, "Rejoined after being muted").catch(() => {});
    // If no config
    if (!guildcfg || !guildcfg.leavejoin) return;
    const leavejoin = guildcfg.leavejoin;
    const leavejoinchannel = guild.channels.find(c => c.id === leavejoin);
    // Sends when a member joined
    leavejoinchannel.createMessage({
      embed: {
        title: "🎉 New Member",
        description: `Welcome to **${guild.name}**, **${member.username}**.`,
        color: bot.embed.colour("success"),
      },
    }).catch(() => {});
  });

  // Logs to the leavejoin channel when a member leaves
  bot.on("guildMemberRemove", async function(guild, member) {
    // Invalid member
    if (!member.username || !member.user && !member.user.username) return;
    else if (!member.username && member.user && member.user.username) member = member.user;
    bot.emit("loggingMemberRemove", guild, member);
    const guildcfg = await bot.db.table("guildcfg").get(guild.id);
    // If no config
    if (!guildcfg || !guildcfg.leavejoin) return;
    const leavejoin = guildcfg.leavejoin;
    const leavejoinchannel = guild.channels.find(c => c.id === leavejoin);
    // Sends when a member leaes
    leavejoinchannel.createMessage({
      embed: {
        title: "👋 Member Left",
        description: `We'll miss you, **${member.username}**.`,
        color: bot.embed.colour("error"),
      },
    }).catch(() => {});
  });

  // Logs details about a new member
  bot.on("loggingMemberAdd", async (guild, member) => {
    const channel = await cansend(guild, "loggingMemberAdd");
    if (!channel || !member) return;
    bot.createMessage(channel, {
      embed: {
        color: bot.embed.colour("success"),
        timestamp: new Date(),
        author: {
          name: `${format.tag(member, false)} joined`,
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
      },
    });
  });

  // Logs details about a member that left
  bot.on("loggingMemberRemove", async (guild, member) => {
    const channel = await cansend(guild, "loggingMemberRemove");
    if (!channel || !member) return;
    bot.createMessage(channel, {
      embed: {
        color: bot.embed.colour("error"),
        timestamp: new Date(),
        author: {
          name: `${format.tag(member, false)} left`,
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
      },
    });
  });
};
