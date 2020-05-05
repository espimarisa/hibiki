/*
  Attempts to detect message spam and punishes spammy members.
*/

const punish = require("./Punishments");

module.exports = async (msg, bot, cfg) => {
  const spam = bot.antiSpam.filter(s => s.guild === msg.channel.guild.id && s.id === msg.author.id && new Date().getTime() - s.date < 2500);
  // If the spam spam threshold isnt set default to 6
  if (!cfg.spamThreshold) cfg.spamThreshold = 7;

  // If the spam threshold is met
  if (spam.length >= cfg.spamThreshold) {
    cfg.spamPunishments.forEach(async punishment => {
      if (punishment === "Mute") punish.mute(msg, bot, cfg, spam);
      if (punishment === "Purge") punish.purge(msg, bot.antiSpam.filter(s => s.guild === msg.channel.guild.id && s.id === msg.author.id && new Date().getTime() - s.date < 10000).map(s => s.msgid)).catch(() => {});
      if (punishment === "Warn") punish.warn(msg, bot, "Spam (Automod)");
      // Sends a message if msgOnPunishment is enabled
      if (cfg.msgOnPunishment) {
        const pmsg = await msg.channel.createMessage(bot.embed(`🔨 ${msg.author.username} has been ${cfg.spamPunishments.map(p => `${p.toLowerCase()}ed`).filter(p => p !== "purged").join(" and ")} for spamming.`, null, "error"));
        setTimeout(() => pmsg.delete("AutoMod message deletion").catch(() => {}), 3000);
      }
    });

    // Antispam
    bot.antiSpam.forEach(a => {
      // Returns if authors or guilds aren't the same
      if (a.id !== msg.author.id) return;
      if (a.guild !== msg.channel.guild.id) return;
      bot.antiSpam.splice(bot.antiSpam.indexOf(a), 1);
    });
  }

  // Pushes the antispam
  bot.antiSpam.push({
    date: new Date().getTime(),
    id: msg.author.id,
    guild: msg.channel.guild.id,
    content: msg.content,
    msgid: msg.id,
  });
};
