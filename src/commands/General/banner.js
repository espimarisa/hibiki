const Command = require("../../lib/structures/Command");

class bannerCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Displays the server's banner.",
      cooldown: 3000,
    });
  }

  async run(msg) {
    // Errors if the server doesn't have a banner
    if (!msg.channel.guild.banner) return msg.channel.createMessage(this.bot.embed("❌ Error", "This server doesn't have a banner.", "error"));
    // Sends the banner
    msg.channel.createMessage({
      embed: {
        title: `🖼 ${msg.guild.name}'s banner`,
        color: require("../../utils/Colour")("general"),
        image: {
          url: msg.guild.dynamicBannerURL(),
        },
      },
    });
  }
}

module.exports = bannerCommand;
