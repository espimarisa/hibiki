const Command = require("../../structures/Command");

class agreeCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Gives you the set agree role if the server has it configured.",
    });
  }

  async run(msg) {
    const guildconfig = await this.bot.db.table("guildconfig").get(msg.channel.guild.id).run();
    if (!guildconfig || guildconfig && !guildconfig.agreeChannel) return;

    // Finds the agree channel
    const agreeChannel = await msg.channel.guild.channels.find(c => c.id === guildconfig.agreeChannel);
    if (!agreeChannel) return;
    if (msg.channel.id !== agreeChannel.id) return;

    // Finds the agree role
    const agreeRole = await msg.channel.guild.roles.find(r => r.id === guildconfig.agreeRole);
    if (!agreeRole) return;

    // Returns if the member already has the agreement role
    const memberRole = await msg.member.roles.includes(agreeRole.id);
    if (memberRole === true) return;

    // Deletes content that isn't "agree" if setup to do so
    // TODO: Actually test and implement this elsewhere.
    // FIXME: Stupid fucking prefix bullshit!
    /* if (guildconfig && guildconfig.cleanAgreeChannel) {
      // This is prone to breaking. We *really* need to pass this.currentPrefix as an option to our handler, it would make this so much easier..
      // and less prone to random fuckups due to our shitty code. Additionally it's a good idea to do so anyways.
      const prefix = guildconfig && guildconfig.prefix ? guildconfig.prefix : this.bot.config.prefixes[0];

      // Don't delete staff member's messages. Hopefully this doesn't break as I took it from the fucking horrendous handler.
      // TODO: Actually pass whether the member has staff perms or not to the Command structure (this.memberIsStaff). Fuck this shit.
      if (msg.member.permission.has("administrator") || guildconfig && guildconfig.staffRole && msg.member.roles.includes(guildconfig.staffRole)) return;
      else if (msg && msg.content && !msg.content.startsWith(`${prefix}agree`)) return msg.delete().catch(() => {});

      // TODO: Actually handle all of our .catch(() => {}) stuff, at least the ones that are moderation related...
      // ... so we get less questions about "why the hell is this module not working" and more about "why do you write shit code"
    } */

    // Adds the agree role and deletes the message
    await msg.member.addRole(agreeRole.id, "Ran the agree command").catch(() => {});
    await msg.delete().catch(() => {});
  }
}

module.exports = agreeCommand;
