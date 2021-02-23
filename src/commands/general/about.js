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
        case "aix":
          return `IBM AIX ${release}`;
        case "android":
          return `Android ${release}`;
        case "darwin":
          return `macOS ${(parseFloat(release).toFixed(2) - parseFloat("7.6").toFixed(2) + parseFloat("0.03")).toFixed(2)}`;
        case "linux":
          return `Linux ${release}`;
        case "freebsd":
          return `FreeBSD ${release}`;
        case "openbsd":
          return `OpenBSD ${release}`;
        case "sunos":
          return `Solaris ${release}`;
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

    let useramnt = 0;
    this.bot.guilds.forEach(g => { useramnt += g.memberCount; });

    msg.channel.createMessage({
      embed: {
        title: "🤖 About",
        description: `**${this.bot.user.username}**, by [smolespi](https://lesbian.codes), [resolved](https://github.com/resolvedxd), and [contributors](https://github.com/smolespi/Hibiki/graphs/contributors). 💖`,
        color: this.bot.embed.color("general"),
        fields: [{
          name: "Analytics",
          value: `${useramnt} total users \n` + `${this.bot.guilds.size} total servers \n` +
            `${this.bot.commands.length} commands \n` + `${this.bot.events.length} running events \n` +
            `${format.uptime(process.uptime())} of uptime`,
          inline: true,
        }, {
          name: "Version",
          value: `Hibiki v${this.bot.version} \n` + `Eris v${require("eris").VERSION} \n` + `Node.js ${process.version}\n` +
            `V8 v${process.versions.v8}`,
          inline: true,
        }, {
          name: "Host Info",
          value: `Bot using ${formatBytes(process.memoryUsage().rss)} of memory \n` +
            `System using ${formatBytes(os.totalmem() - os.freemem())} of memory \n` +
            `System up for ${format.uptime(os.uptime())} \n` +
            `Running on ${formatOS(os.platform(), os.release())} ${os.arch()}`,
          inline: false,
        }, {
          name: "About",
          value: `${this.bot.user.username} is an easy and powerful all-in-one Discord bot. \n` +
            "Wanna see how everything works? View the [GitHub](https://github.com/smolespi/Hibiki) repository. \n" +
            `[Dashboard](${this.bot.config.homepage}/manage/servers) • [Invite](${this.bot.config.homepage}/invite/) • [Privacy](${this.bot.config.homepage}/privacy/) • [Support](https://discord.gg/gZEj4sM) • [Vote](https://top.gg/bot/${this.bot.user.id}/vote) • [Website](${this.bot.config.homepage})`,
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
