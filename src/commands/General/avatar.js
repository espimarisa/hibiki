const Command = require("../../lib/structures/Command");
const format = require("../../lib/scripts/Format");

class avatarCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[user:user&fallback]",
      aliases: ["pfp", "profilepic", "profilepicture", "uicon", "usericon"],
      description: "Displays a user's avatar.",
      cooldown: 3,
    });
  }

  async run(msg, args, pargs) {
    // Sends the avatar
    msg.channel.createMessage({
      embed: {
        color: this.bot.embed.colour("general"),
        author: {
          icon_url: pargs[0].value.user.dynamicAvatarURL(null),
          name: format.tag(pargs[0].value.user, false),
        },
        image: {
          url: pargs[0].value.user.dynamicAvatarURL(null),
        },
      },
    });
  }
}

module.exports = avatarCommand;
