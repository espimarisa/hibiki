/**
 * @fileoverview Automod antiInvite module
 * @description Looks for discord invites and applies a punishment if set
 * @module automod/antiInvite
 */

const punish = require("./punishments");

module.exports = async (msg, bot, cfg) => {
  // Discord invite regex
  if (/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|list)|discord(app)?\.com\/invite)\/.+[a-z]/.test(msg.content)) {
    let warning;
    // Looks for each type of punishment
    cfg.invitePunishments.forEach(async punishment => {
      if (punishment === "Warn") warning = await punish.warn(msg, bot, "Sent an invite (Automod)");
      if (punishment === "Purge") msg.delete();
      if (punishment === "Mute") punish.mute(msg, bot, cfg);
    });

    // If msgOnPunishment is on
    if (cfg.msgOnPunishment) {
      const pmsg = await bot.embed("⚠️ Automod", "Invites aren't allowed here.", msg, "error");
      setTimeout(() => pmsg.delete("AutoMod message deletion").catch(() => {}), 4000);
    }

    bot.emit("automodantiInvite", msg.channel.guild, msg.member, msg.content, warning);
    await msg.member.addRole(cfg.mutedRole, "AutoMod").catch(() => {});
  }
};
