const Command = require("../../structures/Command");

class verifyCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["t", "trust", "v"],
      args: "<member:member&strict>",
      description: "Gives the verified role to a member.",
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

    // If member already has verified role
    if (user.roles.includes(guildconfig.verifiedRole)) {
      return this.bot.embed("❌ Error", `**${user.username}** already has the verified role.`, msg, "error");
    }

    // Adds the role
    try {
      await user.addRole(guildconfig.verifiedRole, `Verified by ${this.bot.tag(msg.author, true)}`);
    } catch (err) {
      return this.bot.embed("❌ Error", `Failed to verify **${this.bot.tag(user.username)}**.`, msg, "error");
    }

    this.bot.emit("memberVerify", msg.channel.guild, msg.member, user);
    this.bot.embed("✅ Success", `The verified role was given to **${user.username}**.`, msg, "success");
  }
}

module.exports = verifyCommand;
