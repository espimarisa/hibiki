const Command = require("../../lib/structures/Command");

class aboutcmd extends Command {
  constructor(...args) {
    super(...args, {
      description: "Provides info and stats about the bot.",
    });
  }

  async run(msg) {
    // Gets the user amount
    let users = 0;
    this.bot.guilds.forEach(g => {
      users += g.memberCount;
    });

    // Sets the description
    let desc = [{
      name: "👥",
      value: `**${users}** users`,
      inline: true,
    }, {
      name: "💬",
      value: `**${this.bot.guilds.size}** servers`,
      inline: true,
    }, {
      name: " <:nodejs:692503058407620620>",
      value: `**${process.version}**`,
      inline: true,
    }, {
      name: "⚙",
      value: `**${Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100} mb** used`,
      inline: true,
    }]

    msg.channel.createMessage({
      embed: {
        title: `🤖 About`,
        description: desc.map(t => `${t.name} ${t.value}`).join("\n"),
        color: this.bot.embed.colour("general"),
      }
    });
  }
}

module.exports = aboutcmd;
