const Command = require("../../lib/structures/Command");
const format = require("../../lib/scripts/Format");
const os = require("os");

class aboutCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["ab", "aboutbot", "info", "stats", "uptime"],
      description: "Shows info & stats about the bot.",
    });
  }

  async run(msg) {
    // Gets total users
    let users = 0;
    this.bot.guilds.forEach(g => {
      users += g.memberCount;
    });

    // Sets description fields
    let desc = [{
      name: "\n",
      value: `The ultimate all-in-one Discord bot. \n Made with 💜 by [smolespi](https://lesbian.codes) & [resolved](https://github.com/resolvedxd).`,
    }, {
      name: "\n",
      value: "**Bot Stats**",
    }, {
      name: "👥",
      value: `${users} users`,
    }, {
      name: "💬",
      value: `${this.bot.guilds.size} servers`,
    }, {
      name: "📔",
      value: `${this.bot.commands.size} commands`,
    }, {
      name: "📕",
      value: `Node ${process.version}`,
    }, {
      name: "📚",
      value: `Eris v${require("eris").VERSION}`,
    }, {
      name: "🤖",
      value: `Hibiki v${require("../../package").version}`,
    }, {
      name: "🕒",
      value: `${format.uptimeFormat(process.uptime())}`,
    }, {
      name: "🧮",
      value: `${Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100} mb used `,
    }, {
      name: "🖥",
      value: `${format.formatOs(os.platform(), os.release())}`,
    }, {
      name: "\n",
      value: "**About**",
    }, {
      name: "",
      value: `${this.bot.user.username} is a general-purpose bot powered by [Verniy](https://github.com/smolespi/Verniy). \n It's simple & easy-to-use for most server's needs.`,
    }, {
      name: "",
      value: `[GitHub](${this.bot.cfg.repo}) • [Invite](https://${this.bot.cfg.homepage}/invite/) • [Support](https://discord.gg/${this.bot.cfg.support}) • [Vote](https://top.gg/bot/${this.bot.user.id}/vote) • [Website](${this.bot.cfg.homepage})`,
    }]

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: `✨ About ${this.bot.user.username}`,
        description: desc.map(t => `${t.name} ${t.value}`).join("\n"),
        color: this.bot.embed.colour("general"),
        thumbnail: {
          url: this.bot.user.dynamicAvatarURL("png", 512),
        },
      }
    });
  }
}

module.exports = aboutCommand;
