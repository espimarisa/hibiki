const Command = require("../../lib/structures/Command");

class avatarCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["pfp", "profilepic", "profilepicture", "uicon", "usericon"],
      args: "<:user:>",
      description: "Displays a user's avatar.",
      cooldown: 3,
    });
  }

  async run(msg, args) {
    msg.channel.createMessage(this.bot.embed("lol retard", "idiot", "error"));
  }
}

module.exports = avatarCommand;
