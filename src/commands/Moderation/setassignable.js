const Command = require("../../lib/structures/Command");

class addassignableCommand extends Command {
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
    const assignable = await this.bot.db.table("rolecfg").filter({
      guild: msg.channel.guild.id,
      id: role.id,
    });

    if (!assignable.length) {
      // Adds role to cfg
      await this.bot.db.table("rolecfg").insert({
        guild: msg.channel.guild.id,
        id: role.id,
        assignable: true,
      });

      // Sends the embed
      this.bot.emit("setAssignable", msg.channel.guild, msg.member, role);
      msg.channel.createMessage(this.bot.embed("✅ Success", `**${role.name}** can now be assigned using the assign command.`, "success"));
    } else {
      msg.channel.createMessage(this.bot.embed("❌ Error", `**${role.name}** is already set to be assignable.`, "error"));
    }
  }
}

module.exports = addassignableCommand;
