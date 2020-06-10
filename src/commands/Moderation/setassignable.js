const Command = require("structures/Command");

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
    if (role.managed) return msg.channel.createMessage(this.bot.embed("❌ Error", "That role isn't able to be assigned.", "error"));
    let guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);

    if (!guildcfg || !guildcfg.assignableRoles || !guildcfg.assignableRoles.length) {
      await this.bot.db.table("guildcfg").insert({ id: msg.channel.guild.id, assignableRoles: [] });
      guildcfg = { id: msg.channel.guild.id, assignableRoles: [] };
    }

    if (!guildcfg.assignableRoles.includes(role.id)) {
      // Updates the guildcfg
      guildcfg.assignableRoles.push(role.id);
      await this.bot.db.table("guildcfg").get(msg.channel.guild.id).update(guildcfg);
      this.bot.emit("setAssignable", msg.channel.guild, msg.member, role);
      msg.channel.createMessage(this.bot.embed("✅ Success", `**${role.name}** can now be assigned using the assign command.`, "success"));
    } else {
      // If role is already set
      return msg.channel.createMessage(this.bot.embed("❌ Error", `**${role.name}** is already assignable.`, "error"));
    }
  }
}

module.exports = addassignableCommand;
