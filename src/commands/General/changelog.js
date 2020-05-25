const Command = require("../../lib/structures/Command");

class changelogCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["cl", "clog", "updates", "whatsnew"],
      description: "Sends the latest version's changelog.",
      allowdms: true,
    });
  }

  run(msg) {
    msg.channel.createMessage(this.bot.embed("📚 Changelog", "The latest changes can be viewed on [GitHub](https://github.com/smolespi/Hibiki/releases/latest)."));
  }
}

module.exports = changelogCommand;
