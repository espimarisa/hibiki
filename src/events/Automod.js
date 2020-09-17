// TODO: refactor all automod
const Eris = require("eris");
const Event = require("../structures/Event");

class automod extends Event {
  constructor(...args) {
    super(...args, {
      name: "messageCreate",
    });
  }

  async run(msg) {
    if (msg.channel instanceof Eris.PrivateChannel) return;
    if (!msg.member) return;
    if (msg.bot) return;
    const cfg = await this.bot.db.table("guildconfig").get(msg.channel.guild.id).run();
    if (!cfg) return;

    // Don't automod staff
    if (msg.member && msg.member.roles && (cfg && cfg.staffRole &&
        msg.member.roles.includes(cfg.staffRole) || msg.member.permission.has("administrator") ||
        msg.member.permission.has("manageGuild") || msg.member.permission.has("manageMessages")))
      return;

    if (cfg.antiSpam && cfg.spamPunishments) await require("../utils/automod/antiSpam")(msg, this.bot, cfg);
    if (cfg.antiInvite && cfg.invitePunishments) await require("../utils/automod/antiInvite")(msg, this.bot, cfg);
  }
}

module.exports = automod;
