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
    const guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);

    // If guild has no cfg
    if (!guildcfg || !guildcfg.assignableRoles || !guildcfg.assignableRoles.length) {
      await this.bot.db.table("guildcfg").insert({ id: msg.channel.guild.id, assignableRoles: [] });
    }

    if (!args.length) {
      // Sends list of roles
      let assignableroles = guildcfg.assignableRoles.map(r => {
        if (msg.channel.guild.roles.has(r)) return `\`${msg.channel.guild.roles.get(r).name}\``;
      });

      assignableroles = assignableroles.filter(r => r !== undefined);
      return msg.channel.createMessage(this.bot.embed("📃 Assignable Roles", assignableroles.join(", ") || "This server has no assignable roles."));
    }

    // Looks for the role
    const role = pargs[0].value;
    if (!role) return msg.channel.createMessage(this.bot.embed("❌ Error", "No **role** was provided.", "error"));
    const assignable = guildcfg.assignableRoles.includes(role.id);

    // Sends the embed
    if (assignable) {
      // Adds the role
      await msg.member.addRole(role.id, "Self-assignable role").catch(() => {
        msg.channel.createMessage(this.bot.embed("❌ Error", "Failed to give you the role."));
      });
      this.bot.emit("roleAssign", msg.channel.guild, msg.member, role);
      msg.channel.createMessage(this.bot.embed("✅ Success", `You now have the **${role.name}** role.`, "success"));
    } else if (!assignable) return msg.channel.createMessage(this.bot.embed("❌ Error", "That isn't an assignable role.", "error"));
  }
}

module.exports = assignCommand;
