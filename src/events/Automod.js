/*
  This loads/handles each type of automod.
*/

const Eris = require("eris");
const Event = require("../lib/structures/Event");

// Sets the Automod event
class automod extends Event {
  constructor(...args) {
    super(...args, {
      name: "messageCreate",
    });
  }

  async run(msg) {
    // Return if its a DM
    if (msg.channel instanceof Eris.PrivateChannel) return;
    // Returns if invalid
    if (!msg.member) return;
    if (msg.bot) return;
    // Gets cfg
    const cfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);
    if (!cfg) return;
    // If the member has the staff role or admin, manageguild, or managemessages permission, don't run
    if (msg.member && msg.member.roles && (cfg && cfg.staffRole && msg.member.roles.includes(cfg.staffRole) || msg.member.permission.has("administrator") || msg.member.permission.has("manageGuild") || msg.member.permission.has("manageMessages"))) return;
    if (cfg.antiSpam && cfg.spamPunishments) await require("../ext/automod/AntiSpam")(msg, this.bot, cfg);
    if (cfg.antiInvite && cfg.invitePunishments) await require("../ext/automod/AntiInvite")(msg, this.bot, cfg);
  }
}

module.exports = automod;
