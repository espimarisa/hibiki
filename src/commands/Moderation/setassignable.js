const Command = require("../../structures/Command");

class setassignableCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["addassign", "addassignable", "addassignablerole", "assignablerole", "makeassign", "makeassignable"],
      args: "<role:role>",
      description: "Sets a role to be assignable.",
      requiredperms: "manageRoles",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const role = pargs[0].value;

    // Prevents assignable integration roles
    if (role.managed) return this.bot.embed("❌ Error", "That role isn't able to be assigned.", msg, "error");
    let guildconfig = await this.bot.db.table("guildconfig").get(msg.channel.guild.id).run();

    // If no guildconfig
    if (!guildconfig || !guildconfig.assignableRoles || !guildconfig.assignableRoles.length) {
      await this.bot.db.table("guildconfig").insert({
        id: msg.channel.guild.id,
        assignableRoles: [],
      }).run();

      guildconfig = { id: msg.channel.guild.id, assignableRoles: [] };
    }

    // Updates the guildconfig
    if (!guildconfig.assignableRoles.includes(role.id)) {
      guildconfig.assignableRoles.push(role.id);
      await this.bot.db.table("guildconfig").get(msg.channel.guild.id).update(guildconfig).run();
      this.bot.emit("setAssignable", msg.channel.guild, msg.member, role);
      this.bot.embed("✅ Success", `**${role.name}** can now be assigned using the assign command.`, msg, "success");
    } else {
      return this.bot.embed("❌ Error", `**${role.name}** is already assignable.`, msg, "error");
    }
  }
}

module.exports = setassignableCommand;
