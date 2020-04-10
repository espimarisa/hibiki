const Command = require("../../lib/structures/Command");

class bannerCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Displays the server's banner.",
      cooldown: 3,
    });
  }

  async run(msg) {
    // Errors if the server doesn't have a banner
    if (!msg.channel.guild.banner) return msg.channel.createMessage(this.bot.embed("❌ Error", "This server doesn't have a banner.", "error"));
    // Sends the banner
    msg.channel.createMessage({
      embed: {
        color: this.bot.embed.colour("general"),
        author: {
          icon_url: msg.guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
          name: msg.guild.name,
        },
        image: {
          url: msg.guild.dynamicBannerURL(),
        },
      },
    });
  }
}

module.exports = bannerCommand;
