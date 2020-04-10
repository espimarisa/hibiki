const Command = require("../../lib/structures/Command");

class inviteCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Gives a link to invite the bot.",
    });
  }

  run(msg) {
    if (!this.bot.cfg.perms) return msg.channel.createMessage("❌ Error", "No invite permissions set.", "error");
    msg.channel.createMessage(this.bot.embed("📌 Invite", `You can invite ${this.bot.user.username} using [this link](https://discordapp.com/oauth2/authorize?&client_id=${this.bot.user.id}&scope=bot&permissions=${this.bot.cfg.perms}).`, "general"));
  }
}

module.exports = inviteCommand;
