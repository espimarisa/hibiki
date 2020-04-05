const Command = require("../../lib/structures/Command");

class iconCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["guildicon", "servericon"],
      description: "Shows a server's icon.",
      cooldown: 2,
    });
  }

  async run(msg, args) {
    // Gets the guild
    let guild = msg.channel.guild;
    // Lets owners show other server icons
    if (args[0] && this.bot.cfg.owners.includes(msg.author.id)) guild = await this.bot.guilds.find(g => g.name.toLowerCase().startsWith(args.join(" ")) || g.id == args.join(" "));
    else guild = msg.channel.guild;
    if (!guild) return msg.channel.createMessage(this.bot.embed("❌ Error", "Either the guild wasn't found or I'm not in it.", "error"));
    // If a server doesn't have an icon
    if (!guild.iconURL) return msg.channel.createMessage(this.bot.embed("❌ Error", "This server doesn't have an icon set.", "error"));

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: `🖼 ${guild.name}`,
        color: this.bot.embed.colour("general"),
        image: {
          url: guild.iconURL,
        },
      },
    });
  }
}

module.exports = iconCommand;
