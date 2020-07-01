const Event = require("structures/Event");

class Autorole extends Event {
  constructor(...args) {
    super(...args, {
      name: "guildMemberAdd",
    });
  }

  async run(guild, member) {
    // Don't add to muted members who left
    const guildcfg = await this.bot.db.table("guildcfg").get(guild.id).run();
    if (!guildcfg || !guildcfg.autoRoles) return;
    let mute = await this.bot.db.table("mutecache").run();
    mute = mute.find(m => m.member === member.id && m.guild === guild.id);
    if (mute && guildcfg.mutedRole) return;

    // Adds roles
    guildcfg.autoRoles.forEach(role => {
      member.addRole(role, "Role automatically given on join").catch(() => {});
    });
  }
}

module.exports = Autorole;
