const Command = require("structures/Command");

class inviteCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["support"],
      description: "Gives links to invite the bot and for support.",
      allowdms: true,
    });
  }

  run(msg) {
    this.bot.embed("📌 Invite", "[Bot Invite](https://hibiki.app/invite/) • [Support Server](https://hibiki.app/support/})", msg);
  }
}

module.exports = inviteCommand;
