const Command = require("../../lib/structures/Command");
const format = require("../../lib/scripts/Format");

class avatarCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["pfp", "profilepic", "profilepicture", "uicon", "usericon"],
      args: "[user:user&fallback]",
      description: "Displays a user's avatar.",
      cooldown: 3,
    });
  }

  async run(msg, args, pargs) {
    let user = pargs[0].value;
    // Sends the avatar
    msg.channel.createMessage({
      embed: {
        color: this.bot.embed.colour("general"),
        author: {
          icon_url: user.user.dynamicAvatarURL(null),
          name: format.tag(user.user, false),
        },
        image: {
          url: user.user.dynamicAvatarURL(null),
        },
      },
    });
  }
}

module.exports = avatarCommand;
