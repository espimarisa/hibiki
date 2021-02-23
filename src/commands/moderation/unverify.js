const Command = require("../../structures/Command");

class unverifyCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["ut", "untrust", "uv"],
      args: "<member:member&strict>",
      description: "Removes the verified role from A member.",
      clientperms: "manageRoles",
      requiredperms: "manageRoles",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    const guildconfig = await this.bot.db.table("guildconfig").get(msg.channel.guild.id).run();

    // If no role or cfg
    if (!guildconfig || !guildconfig.verifiedRole) {
      await this.bot.db.table("guildconfig").insert({
        id: msg.channel.guild.id,
      }).run();

      return this.bot.embed("❌ Error", "The verified role hasn't been configured yet.", msg, "error");
    }

    // If member doesn't have the verified role
    if (!user.roles.includes(guildconfig.verifiedRole)) {
      return this.bot.embed("❌ Error", `**${user.username}** doesn't have the verified role.`, msg, "error");
    }

    // Removes the role
    try {
      await user.removeRole(guildconfig.verifiedRole, `Unverified by ${this.bot.tag(msg.author, true)}`);
    } catch (err) {
      return this.bot.embed("❌ Error", `Failed to unverify **${user.username}**.`, msg, "error");
    }

    this.bot.emit("memberUnverify", msg.channel.guild, msg.member, user);
    this.bot.embed("✅ Success", `The verified role was removed from **${user.username}**.`, msg, "success");
  }
}

module.exports = unverifyCommand;
