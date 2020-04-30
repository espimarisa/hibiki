const Command = require("../../lib/structures/Command");

class removeassignableCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["removeassign", "removeassignablerole", "rmassign", "rmassignable", "unassignablerole"],
      args: "<role:role>",
      description: "Makes an assignable remove unassignable.",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const role = pargs[0].value;
    // Looks for the role
    const assignable = await this.bot.db.table("rolecfg").filter({
      guild: msg.channel.guild.id,
      id: role.id,
      assignable: true,
    });

    // If no role is found
    if (!assignable.length) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `**${role.name}** isn't set to be assignable.`, "error"));
    }

    // Deletes the role
    await this.bot.db.table("rolecfg").filter({
      guild: msg.channel.guild.id,
      id: role.id,
      assignable: true,
    }).delete();

    // Sends the embed
    msg.channel.createMessage(this.bot.embed("✅ Success", `**${role.name}** is no longer assignable.`, "success"));
  }
}

module.exports = removeassignableCommand;
