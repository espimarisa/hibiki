const Command = require("../../structures/Command");

class setassignableCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["addassign", "addassignable", "addassignablerole", "assignablerole", "makeassign", "makeassignable", "makeassignablerole"],
      args: "<role:role>",
      description: "Sets a role to be assignable.",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const role = pargs[0].value;
    if (role.managed) return this.bot.embed("❌ Error", "That role isn't able to be assigned.", msg, "error");
    let guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id).run();

    // If no guildcfg
    if (!guildcfg || !guildcfg.assignableRoles || !guildcfg.assignableRoles.length) {
      await this.bot.db.table("guildcfg").insert({
        id: msg.channel.guild.id,
        assignableRoles: [],
      }).run();

      guildcfg = { id: msg.channel.guild.id, assignableRoles: [] };
    }

    // Updates the guildcfg
    if (!guildcfg.assignableRoles.includes(role.id)) {
      guildcfg.assignableRoles.push(role.id);
      await this.bot.db.table("guildcfg").get(msg.channel.guild.id).update(guildcfg).run();
      this.bot.emit("setAssignable", msg.channel.guild, msg.member, role);
      this.bot.embed("✅ Success", `**${role.name}** can now be assigned using the assign command.`, msg, "success");
    } else {
      return this.bot.embed("❌ Error", `**${role.name}** is already assignable.`, msg, "error");
    }
  }
}

module.exports = setassignableCommand;
