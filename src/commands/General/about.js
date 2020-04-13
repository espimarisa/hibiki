const Command = require("../../lib/structures/Command");
const os = require("os");

class aboutCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["ab", "aboutbot", "info", "stats", "uptime"],
      description: "Returns info & stats about the bot.",
    });
  }

  async run(msg) {
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

    // Formats uptime
    function uptimeFormat() {
      let uptime = process.uptime();
      const date = new Date(uptime * 1000);
      const days = date.getUTCDate() - 1,
        hours = date.getUTCHours(),
        minutes = date.getUTCMinutes();
      let segments = [];
      if (days > 0) segments.push(`${days} day${days === 1 ? "" : "s"}`);
      if (hours > 0) segments.push(`${hours} hour${hours === 1 ? "" : "s"}`);
      if (minutes === 0) segments.push("Less than a minute");
      if (minutes > 0) segments.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
      const dateString = segments.join(", ");
      return dateString;
    }

    // Sets the description
    let desc = [];
    desc.push({ name: "\n", value: "The ultimate all-in-one Discord bot.", });
    desc.push({ name: "", value: "Made with 💜 by [smolespi](https://lesbian.codes) & [resolved](https://github.com/resolvedxd).", });
    desc.push({ name: "\n", value: "**Bot Stats**", });
    desc.push({ name: "👥", value: `${this.bot.users.size} users`, });
    desc.push({ name: "💬", value: `${this.bot.guilds.size} servers`, });
    desc.push({ name: "📔", value: `${this.bot.commands.size} commands`, });
    desc.push({ name: "📕", value: `Node ${process.version}`, });
    desc.push({ name: "📚", value: `Eris v${require("eris").VERSION}`, });
    desc.push({ name: "🤖", value: `Hibiki v${require("../../package").version}`, });
    desc.push({ name: "🕒", value: `${uptimeFormat(process.uptime())}`, });
    desc.push({ name: "🧮", value: `${Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100} mb used `, });
    desc.push({ name: "🖥", value: `${formatOS(os.platform(), os.release())}`, });
    desc.push({ name: "\n", value: "**About**", });
    desc.push({ name: "", value: `${this.bot.user.username} is a fun, useful, and easy-to-use bot.`, });
    desc.push({ name: "", value: "It's simple and made to fit most server's needs.", });
    desc.push({ name: "", value: `[GitHub](${this.bot.cfg.repo}) • [Invite](https://discordapp.com/oauth2/authorize?&client_id=${this.bot.user.id}&scope=bot&permissions=${this.bot.cfg.perms}) • [Support](https://discord.gg/${this.bot.cfg.support}) • [Vote](https://top.gg/bot/${this.bot.user.id}/vote)`, });

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
