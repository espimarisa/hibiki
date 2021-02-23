const Command = require("../../structures/Command");

class avatarCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["pfp", "profilepic", "profilepicture", "uicon", "usericon"],
      args: "[member:member&fallback]",
      description: "Shows a member's avatar.",
    });
  }

  run(msg, args, pargs) {
    const user = pargs[0].value;

    msg.channel.createMessage({
      embed: {
        color: this.bot.embed.color("general"),
        author: {
          icon_url: user.user.dynamicAvatarURL(null),
          name: this.bot.tag(user.user),
        },
        image: {
          url: user.user.dynamicAvatarURL(null),
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = avatarCommand;
