const Command = require("../../structures/Command");
const format = require("../../utils/format");
const os = require("os");

class aboutCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["aboutbot", "info", "stats", "uptime"],
      description: "Returns info & stats about the bot.",
      allowdms: true,
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

    // Formats bytes
    function formatBytes(amount) {
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      if (amount === 0) return "N/A";
      const i = parseInt(Math.floor(Math.log(amount) / Math.log(1024)));
      if (i === 0) return amount + " " + sizes[i];
      return (amount / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
    }

    msg.channel.createMessage({
      embed: {
        title: "🤖 About",
        description: `**${this.bot.user.username}**, by` +
          " [smolespi](https://lesbian.codes), [resolved](https://github.com/resolvedxd/), and [cth103](https://github.com/cthpw103). 💖",
        color: this.bot.embed.color("general"),
        fields: [{
          name: "Analytics",
          value: `${this.bot.users.size} total users \n` + `${this.bot.guilds.size} total servers \n` +
            `${this.bot.commands.length} commands \n` + `${this.bot.events.length} running events \n` +
            `${format.uptime(process.uptime())} of uptime`,
          inline: true,
        }, {
          name: "Versions",
          value: `Hibiki v${this.bot.version} \n` + `Eris v${require("eris").VERSION} \n` +
            `Node.js ${process.version}\n` + `V8 v${process.versions.v8}`,
          inline: true,
        }, {
          name: `Host Info`,
          value: `Bot using ${formatBytes(process.memoryUsage().rss)} of memory \n` +
            `System using ${formatBytes(os.totalmem() - os.freemem())} of memory \n` +
            `System up for ${format.uptime(os.uptime())} \n` +
            `Running on ${formatOS(os.platform(), os.release())} ${os.arch()}`,
          inline: false,
        }],
        thumbnail: {
          url: this.bot.user.dynamicAvatarURL(),
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = aboutCommand;
