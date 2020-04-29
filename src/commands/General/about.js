const Command = require("../../lib/structures/Command");
const os = require("os");
const format = require("../../lib/scripts/Format");

class aboutCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["ab", "aboutbot", "info", "stats", "uptime"],
      description: "Returns info & stats about the bot.",
    });
  }

  run(msg) {
    // Formats OS platform
    function formatOS(platform, release) {
      switch (platform) {
        case "darwin":
          return `macOS ${(parseFloat(release).toFixed(2) - parseFloat("7.6").toFixed(2) + parseFloat("0.03")).toFixed(2)}`;
        case "linux":
          return `Linux ${release}`;
        case "win32":
          return `Windows ${release}`;
        default:
          return platform;
      }
    }


    // Sets the description
    const desc = [];
    desc.push({ name: "\n", value: "The ultimate all-in-one Discord bot." });
    desc.push({ name: "", value: "Built with 💖 by [smolespi](https://lesbian.codes) & [resolved](https://github.com/resolvedxd)." });
    desc.push({ name: "\n", value: "**Bot Stats**" });
    desc.push({ name: "👥", value: `${this.bot.users.size} users` });
    desc.push({ name: "💬", value: `${this.bot.guilds.size} servers` });
    desc.push({ name: "📔", value: `${this.bot.commands.size} commands` });
    desc.push({ name: "📕", value: `Node ${process.version}` });
    desc.push({ name: "📚", value: `Eris v${require("eris").VERSION}` });
    desc.push({ name: "🤖", value: `Hibiki v${require("../../package").version}` });
    desc.push({ name: "🕒", value: `${format.uptime(process.uptime())}` });
    desc.push({ name: "🧮", value: `${Math.round(process.memoryUsage().rss / (1024 * 1024))}mb used ` });
    desc.push({ name: "🖥", value: `${formatOS(os.platform(), os.release())}` });
    desc.push({ name: "\n", value: "**About**" });
    desc.push({ name: "", value: `${this.bot.user.username} is a fun, useful, and easy-to-use bot.` });
    desc.push({ name: "", value: `Want to learn more? View the [GitHub](https://github.com/smolespi/Hibiki) repository.` });
    desc.push({ name: "", value: `[Invite](${this.bot.cfg.homepage}/invite/) • [Support](https://discord.gg/${this.bot.cfg.support}) • [Vote](https://top.gg/bot/${this.bot.user.id}/vote) • [Website](${this.bot.cfg.homepage})` });

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        description: desc.map(d => `${d.name} ${d.value}`).join("\n"),
        color: this.bot.embed.colour("general"),
        author: {
          icon_url: this.bot.user.dynamicAvatarURL(),
          name: `About ${this.bot.user.username}`,
        },
        thumbnail: {
          url: this.bot.user.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = aboutCommand;
