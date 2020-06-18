const Command = require("structures/Command");

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
        color: this.bot.embed.color("general"),
        author: {
          icon_url: msg.channel.guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
          name: msg.channel.guild.name,
        },
        image: {
          url: msg.channel.guild.iconURL,
        },
      },
    });
  }
}

module.exports = iconCommand;
