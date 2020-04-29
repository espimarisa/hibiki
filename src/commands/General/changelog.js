const Command = require("../../lib/structures/Command");

class changelogCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["cl", "clog", "updates", "whatsnew"],
      description: "Sends the latest version's changelog.",
      cooldown: 3,
    });
  }

  run(msg) {
    msg.channel.createMessage(this.bot.embed("📚 Changelog", "The latest changes can be viewed [here](https://github.com/smolespi/Hibiki/releases/latest)."));
  }
}

module.exports = changelogCommand;
