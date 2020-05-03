const Command = require("../../lib/structures/Command");

class unassignCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["removerole", "iamnot"],
      args: "<role:role>",
      description: "Removes an assignable role from you.",
      clientperms: "manageRoles",
    });
  }

  async run(msg, args, pargs) {
    // Looks for the role
    const role = pargs[0].value;
    const assignable = await this.bot.db.table("rolecfg").filter({
      guild: msg.channel.guild.id,
      id: role.id,
      assignable: true,
    });

    // Sends the embed
    if (assignable.length) {
      // Adds the role
      await msg.member.removeRole(role.id, "Self-assignable role").catch(() => {
        msg.channel.createMessage(this.bot.embed("❌ Error", "Failed to remove the role from you."));
      });
      this.bot.emit("roleUnassign", msg.channel.guild, msg.member, role);
      msg.channel.createMessage(this.bot.embed("✅ Success", `The **${role.name}** role was removed from you.`, "success"));
    } else if (!assignable.length) return msg.channel.createMessage(this.bot.embed("❌ Error", "That isn't an assignable role.", "error"));
  }
}

module.exports = unassignCommand;
