const Command = require("../../lib/structures/Command");
const format = require("../../lib/scripts/Format");

class verifyCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<member:member>",
      aliases: ["t", "trust", "v"],
      description: "Gives the verified role to a user.",
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

    // If member already has verified role
    if (user.roles.includes(guildcfg.verified)) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `**${user.username}** already has the verified role.`, "error"));
    }

    // Gives member the role
    await user.addRole(guildcfg.verified, `Verified by ${format.tag(msg.author, true)}`);
    msg.channel.createMessage(this.bot.embed("✅ Success", `The verified role was given to **${user.username}**.`, "success"));
  }
}

module.exports = verifyCommand;
