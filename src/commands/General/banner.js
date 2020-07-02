const Command = require("../../structures/Command");

class bannerCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Sends the server's banner.",
    });
  }

  run(msg) {
    if (!msg.channel.guild.banner) return this.bot.embed("❌ Error", "This server doesn't have a banner.", msg, "error");

    msg.channel.createMessage({
      embed: {
        color: this.bot.embed.color("general"),
        author: {
          icon_url: msg.channel.guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
          name: msg.channel.guild.name,
        },
        image: {
          url: msg.channel.guild.dynamicBannerURL(),
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = bannerCommand;
