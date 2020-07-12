/*
  This handles each type of automod punishment.
*/

const { Snowflake } = require("../../utils/snowflake");

module.exports.mute = async (msg, bot, cfg, reason) => {
  const member = msg.member;
  const guild = msg.channel.guild;
  if (member.roles && member.roles.includes(cfg.mutedRole)) return;
  await bot.db.table("mutecache").insert({
    role: "",
    member: member.id,
    guild: guild.id,
  }).run();

  // Insert's the member's roles into the mutecache
  await member.roles.forEach(async role => {
    await bot.db.table("mutecache").insert({
      role: role,
      member: member.id,
      guild: guild.id,
    }).run();

    // Tries to remove their previous roles
    await guild.removeMemberRole(member.id, role, "AutoMod").catch(() => {});
  });

  // Adds the muted role to the user
  await member.addRole(cfg.mutedRole, "AutoMod").catch(() => {});
  if (reason) bot.emit("automodMute", guild, member, reason);
};

// Purge function
module.exports.purge = async (m, msgs) => {
  if (Array.isArray(msgs)) m.channel.deleteMessages(msgs).catch(() => {});
  else m.channel.deleteMessage(msgs).catch(() => {});
};

// Warning function
module.exports.warn = async (msg, bot, reason) => {
  const id = Snowflake();
  await bot.db.table("warnings").insert({
    giver: bot.user.id,
    receiver: msg.author.id,
    guild: msg.channel.guild.id,
    id: id,
    reason: reason || "Automod",
  }).run();

  return id;
};
