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
    const role = pargs[0].value;
    const guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);

    if (!guildcfg || !guildcfg.assignableRoles || !guildcfg.assignableRoles.length) {
      await this.bot.dsb.table("guildcfg").insert({ id: msg.channel.guild.id, assignableRoles: [] });
    }

    const assignable = guildcfg.assignableRoles.includes(role.id);

    if (assignable) {
      // Adds the role
      await msg.member.removeRole(role.id, "Self-assignable role").catch(() => {
        msg.channel.createMessage(this.bot.embed("❌ Error", "Failed to remove the role from you."));
      });
      this.bot.emit("roleUnassign", msg.channel.guild, msg.member, role);
      msg.channel.createMessage(this.bot.embed("✅ Success", `The **${role.name}** role was removed from you.`, "success"));
    } else if (!assignable) return msg.channel.createMessage(this.bot.embed("❌ Error", "That isn't an assignable role.", "error"));
  }
}

module.exports = unassignCommand;
