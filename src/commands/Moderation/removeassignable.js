const Command = require("structures/Command");

class removeassignableCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["removeassign", "removeassignablerole", "rmassign", "rmassignable", "unassignable", "unassignablerole"],
      args: "<role:role>",
      description: "Makes an assignable remove unassignable.",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const role = pargs[0].value;
    let guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);

    if (!guildcfg) {
      await this.bot.db.table("guildcfg").insert({ id: msg.channel.guild.id });
      guildcfg = { id: msg.channel.guild.id };
    }

    if (!guildcfg.assignableRoles.length || !guildcfg.assignableRoles.includes(role.id)) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `**${role.name}** isn't set to be assignable.`, "error"));
    }

    // Updates the guildcfg
    guildcfg.assignableRoles.splice(guildcfg.assignableRoles.indexOf(role.id), 1);
    await this.bot.db.table("guildcfg").get(msg.channel.guild.id).update(guildcfg);
    this.bot.emit("removeAssignable", msg.channel.guild, msg.member, role);
    msg.channel.createMessage(this.bot.embed("✅ Success", `**${role.name}** is no longer assignable.`, "success"));
  }
}

module.exports = removeassignableCommand;
