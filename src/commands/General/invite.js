const Command = require("../../lib/structures/Command");

class inviteCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Gives a link to invite the bot.",
      allowdms: true,
    });
  }

  run(msg) {
    msg.channel.createMessage(this.bot.embed("📌 Invite", `You can invite ${this.bot.user.username} using [this link](https://discordapp.com/oauth2/authorize?&client_id=${this.bot.user.id}&scope=bot&permissions=506850534).`));
  }
}

module.exports = inviteCommand;
