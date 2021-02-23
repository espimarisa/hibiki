const Command = require("../../structures/Command");

class changelogCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["cl", "clog", "updates", "whatsnew"],
      description: "Sends the latest version's changelog.",
      allowdms: true,
    });
  }

  run(msg) {
    this.bot.embed("📚 Changelog", "You can view the latest changes [here](https://github.com/smolespi/Hibiki/releases/latest).", msg);
  }
}

module.exports = changelogCommand;
