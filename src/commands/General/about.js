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

    let desc = [];
    // Sets the description
    desc.push({ name: "\n", value: "The ultimate all-in-one Discord bot.", });
    desc.push({ name: "", value: "Made with 💜 by [smolespi](https://lesbian.codes) & [resolved](https://github.com/resolvedxd).", });
    desc.push({ name: "\n", value: "**Bot Stats**", });
    desc.push({ name: "👥", value: `${users} users`, });
    desc.push({ name: "💬", value: `${this.bot.guilds.size} servers`, });
    desc.push({ name: "📔", value: `${this.bot.commands.size} commands`, });
    desc.push({ name: "📕", value: `Node ${process.version}`, });
    desc.push({ name: "📚", value: `Eris v${require("eris").VERSION}`, });
    desc.push({ name: "🤖", value: `Verniy v${require("../../package").version}`, });
    desc.push({ name: "🕒", value: `${format.uptimeFormat(process.uptime())}`, });
    desc.push({ name: "🧮", value: `${Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100} mb used `, });
    desc.push({ name: "🖥", value: `${format.formatOs(os.platform(), os.release())}`, });
    desc.push({ name: "\n", value: "**About**", });
    desc.push({ name: "", value: `${this.bot.user.username} is a general-purpose bot powered by [Verniy](https://github.com/smolespi/Verniy)`, });
    desc.push({ name: "", value: "It's simple & easy-to-use for most server's needs.", });
    desc.push({ name: "", value: `[Invite](https://${this.bot.cfg.homepage}/invite/) • [Support](https://discord.gg/${this.bot.cfg.support}) • [Vote](https://top.gg/bot/${this.bot.user.id}/vote)`, });

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: `✨ About ${this.bot.user.username}`,
        description: desc.map(t => `${t.name} ${t.value}`).join("\n"),
        color: this.bot.embed.colour("general"),
        thumbnail: {
          url: this.bot.user.dynamicAvatarURL(),
        },
      }
    });
  }
}

module.exports = aboutCommand;
