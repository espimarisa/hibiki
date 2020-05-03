const Command = require("../../lib/structures/Command");
const format = require("../../lib/scripts/Format");

class unverifyCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<member:member>",
      aliases: ["ut", "untrust", "uv"],
      description: "Removes the verified role from a user.",
      clientperms: "manageRoles",
      requiredperms: "manageRoles",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    const guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);
    const role = await msg.channel.guild.roles.find(r => r.id === guildcfg.verified);

    // If no role or cfg
    if (!guildcfg || !guildcfg.verified || !role) {
      await this.bot.db.table("guildcfg").insert({ id: msg.channel.guild.id });
      return msg.channel.createMessage(this.bot.embed("❌ Error", "The verified role hasn't been configured yet.", "error"));
    }

    // If member doesn't have the verified role
    if (!user.roles.includes(guildcfg.verified)) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `**${user.username}** doesn't have the verified role.`, "error"));
    }

    // Removes the role
    await user.removeRole(guildcfg.verified, `Unverified by ${format.tag(msg.author, true)}`).catch(() => {
      msg.channel.createMessage(this.bot.embed("❌ Error", `Failed to unverify **${user.username}**.`));
    });
    this.bot.emit("memberUnverify", msg.channel.guild, msg.member, user);
    msg.channel.createMessage(this.bot.embed("✅ Success", `The verified role was removed from **${user.username}**.`, "success"));
  }
}

module.exports = unverifyCommand;
