const Command = require("../../structures/Command");

class removeassignableCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["removeassign", "removeassignablerole", "rmassign", "rmassignable", "unassignable"],
      args: "<role:role>",
      description: "Makes an assignable role unassignable.",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const role = pargs[0].value;
    let guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id).run();

    if (!guildcfg) {
      await this.bot.db.table("guildcfg").insert({
        id: msg.channel.guild.id,
      }).run();

      guildcfg = { id: msg.channel.guild.id };
    }

    if (!guildcfg.assignableRoles.length || !guildcfg.assignableRoles.includes(role.id)) {
      return this.bot.embed("❌ Error", `**${role.name}** isn't set to be assignable.`, msg, "error");
    }

    // Updates the guildcfg
    guildcfg.assignableRoles.splice(guildcfg.assignableRoles.indexOf(role.id), 1);
    await this.bot.db.table("guildcfg").get(msg.channel.guild.id).update(guildcfg).run();
    this.bot.emit("removeAssignable", msg.channel.guild, msg.member, role);
    this.bot.embed("✅ Success", `**${role.name}** is no longer assignable.`, msg, "success");
  }
}

module.exports = removeassignableCommand;
