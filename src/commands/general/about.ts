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

  run(msg: Message<TextChannel>) {
    // Formats bytes
    function formatBytes(bytes: number) {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

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
    const botUptime = uptimeFormat(process.uptime());
    const botMemoryUsage = formatBytes(process.memoryUsage().rss);
    const hostMemoryUsage = formatBytes(os.totalmem() - os.freemem());
    const hostPlatform = `${formatPlatform(os.platform(), os.release())} ${os.arch()}`;
    const hostUptime = uptimeFormat(os.uptime());

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

    msg.channel.createMessage({
      embed: {
        title: `🤖 ${msg.string("general.ABOUT")}`,
        description: `${msg.string("general.ABOUT_DESCRIPTION", { username: this.bot.user.username })} 💜`,
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
