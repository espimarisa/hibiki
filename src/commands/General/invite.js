const Command = require("../../lib/structures/Command");

class inviteCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["support"],
      description: "Gives links to invite the bot and for support.",
      allowdms: true,
    });
  }

  run(msg) {
    msg.channel.createMessage(this.bot.embed("📌 Invite", `[Bot Invite](https://discordapp.com/oauth2/authorize?&client_id=${this.bot.user.id}&scope=bot&permissions=506850534) • [Support Server](https://discord.gg/${this.bot.config.support})`));
  }
}

module.exports = inviteCommand;
