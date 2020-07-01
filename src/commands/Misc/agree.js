const Command = require("structures/Command");

class agreeCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Gives the set agree role.",
    });
  }

  async run(msg) {
    let guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id).run();
    if (!guildcfg) guildcfg = { id: msg.channel.guild.id };
    if (!guildcfg.agreeChannel) return;

    // Finds the agree channel
    const agreeChannel = await msg.channel.guild.channels.find(c => c.id === guildcfg.agreeChannel);
    if (!agreeChannel) return;
    if (msg.channel.id !== agreeChannel.id) return;

    // Finds the agree role
    const agreeRole = await msg.channel.guild.roles.find(r => r.id === guildcfg.agreeRole);
    if (!agreeRole) return;
    const memberRole = await msg.member.roles.includes(agreeRole.id);
    if (memberRole === true) return;

    // Adds the agree role and deletes the message
    await msg.member.addRole(agreeRole.id, "Ran the agree command").catch(() => {});
    await msg.delete().catch(() => {});
  }
}

module.exports = agreeCommand;
