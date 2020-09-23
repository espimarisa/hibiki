const Command = require("../../structures/Command");

class removeassignableCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["removeassign", "removeassignablerole", "rmassign", "rmassignable", "unassignable"],
      args: "<role:role>",
      description: "Makes an assignable role unassignable.",
      requiredperms: "manageRoles",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const role = pargs[0].value;
    let guildconfig = await this.bot.db.table("guildconfig").get(msg.channel.guild.id).run();

    if (!guildconfig) {
      await this.bot.db.table("guildconfig").insert({
        id: msg.channel.guild.id,
      }).run();

      guildconfig = { id: msg.channel.guild.id };
    }

    if (!guildconfig.assignableRoles.length || !guildconfig.assignableRoles.includes(role.id)) {
      return this.bot.embed("❌ Error", `**${role.name}** isn't set to be assignable.`, msg, "error");
    }

    // Updates the guildconfig
    guildconfig.assignableRoles.splice(guildconfig.assignableRoles.indexOf(role.id), 1);
    await this.bot.db.table("guildconfig").get(msg.channel.guild.id).update(guildconfig).run();
    this.bot.emit("removeAssignable", msg.channel.guild, msg.member, role);
    this.bot.embed("✅ Success", `**${role.name}** is no longer assignable.`, msg, "success");
  }
}

module.exports = removeassignableCommand;
