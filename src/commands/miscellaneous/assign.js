const Command = require("../../structures/Command");

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
    const guildconfig = await this.bot.db.table("guildconfig").get(msg.channel.guild.id).run();
    if (!guildconfig || !guildconfig.assignableRoles || !guildconfig.assignableRoles.length) {
      await this.bot.db.table("guildconfig").insert({
        id: msg.channel.guild.id,
        assignableRoles: [],
      }).run();
    }

    if (!args.length) {
      // If the server doesn't have any roles
      if (!guildconfig || !guildconfig.assignableRoles || !guildconfig.assignableRoles.length) {
        return this.bot.embed("📃 Assignable Roles", "This server has no assignable roles.", msg);
      }

      // Sends a list of assignable roles
      let assignableroles = guildconfig.assignableRoles.map(r => {
        if (msg.channel.guild.roles.has(r)) return `\`${msg.channel.guild.roles.get(r).name}\``;
      });

      assignableroles = assignableroles.filter(r => r !== undefined);
      return this.bot.embed("📃 Assignable Roles", assignableroles.join(", ") || "This server has no assignable roles.", msg);
    }

    // Looks for the role
    const role = pargs[0].value;
    if (!role) return this.bot.embed("❌ Error", "No **role** was provided.", msg, "error");
    const assignable = guildconfig.assignableRoles.includes(role.id);

    // Assigns the role
    if (assignable) {
      try {
        await msg.member.addRole(role.id, "Self-assignable role");
      } catch (err) {
        return this.bot.embed("❌ Error", "Failed to give you the role.", msg, "error");
      }

      this.bot.emit("roleAssign", msg.channel.guild, msg.member, role);
      this.bot.embed("✅ Success", `You now have the **${role.name}** role.`, msg, "success");
    } else if (!assignable) {
      return this.bot.embed("❌ Error", "That isn't an assignable role.", msg, "error");
    }
  }
}

module.exports = assignCommand;
