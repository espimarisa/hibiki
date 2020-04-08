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

  // todo - remove if else, find a way to make it one (pargs[0].value.user doesnt work on msg.author)
  async run(msg, args, pargs) {
    // Sends the author's avatar
    if (!pargs[0].value.user) {
      msg.channel.createMessage({
        embed: {
          color: this.bot.embed.colour("general"),
          author: {
            icon_url: pargs[0].value.dynamicAvatarURL(null, 1024),
            name: format.tag(pargs[0].value, false),
          },
          image: {
            url: pargs[0].value.dynamicAvatarURL(null, 1024),
          },
        },
      });
    } else {
      // Sends the user's avatar
      msg.channel.createMessage({
        embed: {
          color: this.bot.embed.colour("general"),
          author: {
            icon_url: pargs[0].value.user.dynamicAvatarURL(null, 1024),
            name: format.tag(pargs[0].value.user, false),
          },
          image: {
            url: pargs[0].value.user.dynamicAvatarURL(null, 1024),
          },
        },
      });
    }
  }
}

module.exports = avatarCommand;
