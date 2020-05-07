/*
  Automatically adds autoRoles; ignores muted members.
*/

const Event = require("../lib/structures/Event");

class Autorole extends Event {
  constructor(...args) {
    super(...args, {
      name: "guildMemberAdd",
    });
  }

  async run(guild, member) {
    // Reads the DB
    const guildcfg = await this.bot.db.table("guildcfg").get(guild.id);
    if (!guildcfg || !guildcfg.autoRoles) return;
    // Don't add to muted members who left
    let mute = await this.bot.db.table("mutecache");
    mute = mute.find(m => m.member === member.id && m.guild === guild.id);
    if (mute && guildcfg.mutedRole) return;
    // Adds roles to member
    guildcfg.autoRoles.forEach(role => {
      member.addRole(role, "Role automatically given on join").catch(() => {});
    });
  }
}

module.exports = Autorole;
