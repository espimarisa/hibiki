const Command = require("../../lib/structures/Command");

class assignCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["giverole", "iam"],
      args: "[role:role]",
      description: "Gives you an assignable role.",
      clientperms: "manageRoles",
    });
  }

  async run(msg, args, pargs) {
    if (!args.length) {
      // Sends list of roles if no args
      let assignableroles = (await this.bot.db.table("rolecfg").filter({ guild: msg.channel.guild.id })).map(r => {
        if (msg.channel.guild.roles.has(r.id)) return `\`${msg.channel.guild.roles.get(r.id).name}\``;
      });
      assignableroles = assignableroles.filter(r => r !== undefined);
      return msg.channel.createMessage(this.bot.embed("📃 Assignable Roles", assignableroles.join(", ") || "This server has no assignable roles.", "general"));
    }

    // Looks for the role
    const role = pargs[0].value;
    if (!role) return msg.channel.createMessage(this.bot.embed("❌ Error", "No **role** was provided.", "error"));
    const assignable = await this.bot.db.table("rolecfg").filter({
      guild: msg.channel.guild.id,
      id: role.id,
      assignable: true,
    });

    // Sends the embed
    if (assignable.length) {
      // Adds the role
      await msg.member.addRole(role.id, "Self-assignable role").catch(() => {
        msg.channel.createMessage(this.bot.embed("❌ Error", "Failed to give you the role."));
      });
      this.bot.emit("roleAssign", msg.channel.guild, msg.member, role);
      msg.channel.createMessage(this.bot.embed("✅ Success", `You now have the **${role.name}** role.`, "success"));
    } else if (!assignable.length) return msg.channel.createMessage(this.bot.embed("❌ Error", "That isn't an assignable role.", "error"));
  }
}

module.exports = assignCommand;
