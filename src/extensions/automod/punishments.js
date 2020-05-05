/*
  This handles each type of automod punishment.
*/

const { Snowflake } = require("../../lib/utils/Snowflake");

module.exports.mute = async (msg, bot, cfg, reason) => {
  const member = msg.member;
  const guild = msg.channel.guild;
  // Returns if the user is already muted
  if (member.roles && member.roles.includes(cfg.mutedRole)) return;
  // Inserts the user's info into the mutecache
  await bot.db.table("mutecache").insert({
    role: "",
    member: member.id,
    guild: guild.id,
  });

  // Insert's the user's roles into the mutecache
  await member.roles.forEach(async role => {
    await bot.db.table("mutecache").insert({
      role: role,
      member: member.id,
      guild: guild.id,
    });
    // Tries to remove their previous roles
    await guild.removeMemberRole(member.id, role, "AutoMod").catch(() => {});
  });

  // Adds the muted role to the user
  await member.addRole(cfg.mutedRole, "AutoMod").catch(() => {});
  if (reason) bot.emit("automodMute", guild, member, reason);
};

// Purge
module.exports.purge = async (m, msgs) => {
  if (Array.isArray(msgs)) m.channel.deleteMessages(msgs).catch(() => {});
  else m.channel.deleteMessage(msgs).catch(() => {});
};

// Warning
module.exports.warn = async (msg, bot, reason) => {
  const id = Snowflake();
  await bot.db.table("warnings").insert({
    giver: bot.user.id,
    receiver: msg.author.id,
    guild: msg.channel.guild.id,
    id: id,
    reason: reason || "Automod",
  });

  return id;
};
