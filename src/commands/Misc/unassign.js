const Command = require("structures/Command");

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
    const role = pargs[0].value;
    const guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id).run();

    if (!guildcfg || !guildcfg.assignableRoles || !guildcfg.assignableRoles.length) {
      await this.bot.db.table("guildcfg").insert({
        id: msg.channel.guild.id,
        assignableRoles: [],
      }).run();
    }

    const assignable = guildcfg.assignableRoles.includes(role.id);

    // Removes the role
    if (assignable) {
      try {
        await msg.member.removeRole(role.id, "Self-assignable role");
      } catch (err) {
        return this.bot.embed("❌ Error", "Failed to remove the role from you.", msg, "error");
      }

      this.bot.emit("roleUnassign", msg.channel.guild, msg.member, role);
      this.bot.embed("✅ Success", `The **${role.name}** role was removed from you.`, msg, "success");
    } else if (!assignable) return this.bot.embed("❌ Error", "That isn't an assignable role.", msg, "error");
  }
}

module.exports = unassignCommand;
