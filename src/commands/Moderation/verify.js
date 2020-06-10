const Command = require("structures/Command");
const format = require("utils/format");

class verifyCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["t", "trust", "v"],
      args: "<member:member>",
      description: "Gives the verified role to A member.",
      clientperms: "manageRoles",
      requiredperms: "manageRoles",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    const guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);

    // If no role or cfg
    if (!guildcfg || !guildcfg.verifiedRole) {
      await this.bot.db.table("guildcfg").insert({ id: msg.channel.guild.id });
      return msg.channel.createMessage(this.bot.embed("❌ Error", "The verified role hasn't been configured yet.", "error"));
    }

    // If member already has verified role
    if (user.roles.includes(guildcfg.verifiedRole)) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `**${user.username}** already has the verified role.`, "error"));
    }

    await user.addRole(guildcfg.verifiedRole, `Verified by ${format.tag(msg.author, true)}`).catch(() => {
      msg.channel.createMessage(this.bot.embed("❌ Error", `Failed to verify **${format.tag(user.username)}**.`));
    });

    this.bot.emit("memberVerify", msg.channel.guild, msg.member, user);
    msg.channel.createMessage(this.bot.embed("✅ Success", `The verified role was given to **${user.username}**.`, "success"));
  }
}

module.exports = verifyCommand;
