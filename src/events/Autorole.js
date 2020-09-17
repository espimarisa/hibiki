const Event = require("../structures/Event");

class Autorole extends Event {
  constructor(...args) {
    super(...args, {
      name: "guildMemberAdd",
    });
  }

  async run(guild, member) {
    // Don't add to muted members who left
    const guildconfig = await this.bot.db.table("guildconfig").get(guild.id).run();
    if (!guildconfig || !guildconfig.autoRoles) return;
    let mute = await this.bot.db.table("mutecache").run();
    mute = mute.find(m => m.member === member.id && m.guild === guild.id);
    if (mute && guildconfig.mutedRole) return;

    // Adds roles
    guildconfig.autoRoles.forEach(role => {
      member.addRole(role, "Role automatically given on join").catch(() => {});
    });
  }
}

module.exports = Autorole;
