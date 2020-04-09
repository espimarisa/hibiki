const Command = require("../../lib/structures/Command");

class coinCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["coinflip", "flipcoin"],
      description: "Flips a coin.",
    });
  }

  async run(msg) {
    // Sends the embed
    msg.channel.createMessage({
      embed: {
        description: `❤ **${msg.author.username}** is cuddling **${pargs[0].value.username}**!`,
        color: this.bot.embed.colour("general"),
        image: {
          url: body.url,
        },
        footer: {
          icon_url: this.bot.user.dynamicAvatarURL(),
          text: "Powered by weeb.sh",
        }
      }
    });
  }
}

module.exports = coinCommand;
