import type { Message, TextChannel } from "eris";
import { VERSION as erisVersion } from "eris";
import { version as tsVersion } from "typescript";
import { Command } from "../../classes/Command";
import { uptimeFormat } from "../../utils/format";
import os from "os";

export class AboutCommand extends Command {
  aliases = ["aboutbot", "botinfo", "info", "stats", "statistics", "uptime"];
  description = "Displays bot information and statistics.";
  allowdms = true;

  async run(msg: Message<TextChannel>) {
    // Formats bytes
    function formatBytes(bytes: number) {
      const k = 1024;
      const sizes = [
        msg.string("global.BYTES"),
        msg.string("global.BYTES_KB"),
        msg.string("global.BYTES_MB"),
        msg.string("global.BYTES_GB"),
        msg.string("global.BYTES_TB"),
        msg.string("global.BYTES_PB"),
        msg.string("global.BYTES_EB"),
        msg.string("global.BYTES_ZB"),
        msg.string("global.BYTES_YB"),
        msg.string("global.BYTES_GB"),
      ];

      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(0)) + " " + sizes[i];
    }

    // Formats the host's platform
    function formatPlatform(platform: string, release: string) {
      switch (platform) {
        case "aix":
          return `IBM AIX ${release}`;
        case "android":
          return `Android ${release}`;
        case "darwin":
          return `macOS (darwin) ${release}`;
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

    // Host & bot system information
    const botUptime = uptimeFormat(process.uptime(), msg.string);
    const botMemoryUsage = formatBytes(process.memoryUsage().rss);
    const hostMemoryUsage = formatBytes(os.totalmem() - os.freemem());
    const hostPlatform = `${formatPlatform(os.platform(), os.release())} ${os.arch()}`;
    const hostUptime = uptimeFormat(os.uptime(), msg.string);

    // Information strings
    const statisticsString = msg.string("general.ABOUT_STATISTICS_STRING", {
      users: this.bot.users.size,
      guilds: this.bot.guilds.size,
      commands: this.bot.commands.length,
      uptime: botUptime,
    });

    const moduleString = msg.string("general.ABOUT_MODULES_STRING", {
      botVersion: process.env.npm_package_version,
      erisVersion: erisVersion,
      nodeVersion: process.version,
      tsVersion: tsVersion,
    });

    const hostString = msg.string("general.ABOUT_HOST_STRING", {
      botMemoryUsage: botMemoryUsage,
      hostMemoryUsage: hostMemoryUsage,
      uptime: hostUptime,
      platform: hostPlatform,
    });

    const linkString = msg.string("general.ABOUT_LINK_STRING", {
      invite: `https://discord.com/oauth2/authorize?&client_id=${this.bot.user.id}&scope=bot&permissions=506850534`,
      privacy: "https://hibiki.app/privacy/",
      support: "https://discord.gg/gZEj4sM",
      github: "https://github.com/smolespi/hibiki",
      translate: "https://translate.hibiki.app",
      website: `${this.bot.config.homepage}`,
    });

    msg.channel.createMessage({
      embed: {
        title: `🤖 ${msg.string("general.ABOUT")}`,
        description: `${msg.string("general.ABOUT_DESCRIPTION", { username: this.bot.user.username })}`,
        color: msg.convertHex("general"),
        fields: [
          {
            name: msg.string("general.ABOUT_STATISTICS"),
            value: statisticsString,
            inline: true,
          },
          {
            name: msg.string("general.ABOUT_MODULES"),
            value: moduleString,
            inline: true,
          },
          {
            name: msg.string("general.ABOUT_HOST"),
            value: hostString,
            inline: false,
          },
          {
            name: msg.string("global.LINKS"),
            value: linkString,
            inline: false,
          },
        ],
        thumbnail: {
          url: this.bot.user.dynamicAvatarURL(),
        },
        footer: {
          text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
