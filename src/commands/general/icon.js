const Command = require("../../structures/Command");

class iconCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["guildicon", "servericon"],
      description: "Sends the server's icon.",
    });
  }

  run(msg) {
    if (!msg.channel.guild.iconURL) this.bot.embed("❌ Error", "This server doesn't have an icon set.", msg, "error");

    msg.channel.createMessage({
      embed: {
        title: `🖼 ${msg.channel.guild.name}`,
        color: this.bot.embed.color("general"),
        image: {
          url: msg.channel.guild.iconURL,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = iconCommand;
