/**
 * @file About command
 * @author Espi <contact@espi.me>
 * @command
 */

import { Message, TextChannel, VERSION as erisVersion } from "eris";
import { version as tsVersion } from "typescript";
import { version as botVersion } from "../../../package.json";
import { Command, CommandCategories, LocaleString } from "../../structures/Command";
import { hibikiClient } from "../../structures/Client";
import os from "os";

class aboutCommand extends Command {
  name = "about";
  category = CommandCategories.GENERAL;
  aliases = ["aboutbot", "botinfo", "botstats", "info", "information", "stats", "statistics", "uptime"];
  description = "Displays bot information and statistics.";
  allowdms: true = true;

  async run(msg: Message<TextChannel>, string: LocaleString, bot: hibikiClient): Promise<void> {
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

    // Formats uptime
    function formatUptime(uptime: number): string {
      const date = new Date(uptime * 1000);
      const days = date.getUTCDate() - 1;
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
      const segments = [];
      if (days > 0) segments.push(`${days} day${days === 1 ? "" : "s"}`);
      if (hours > 0) segments.push(`${hours} hour${hours === 1 ? "" : "s"}`);
      if (minutes === 0) segments.push("less than a minute");
      if (minutes > 0) segments.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
      const dateString = segments.join(", ");
      return dateString;
    }

    // Host & bot system information
    const botUptime = formatUptime(process.uptime());
    const botMemoryUsage = formatBytes(process.memoryUsage().rss);
    const hostMemoryUsage = formatBytes(os.totalmem() - os.freemem());
    const hostPlatform = `${formatPlatform(os.platform(), os.release())} ${os.arch()}`;
    const hostUptime = formatUptime(os.uptime());

    // Information strings
    const statisticsString = string("general.ABOUT_STATISTICS_STRING", {
      users: bot.users.size,
      guilds: bot.guilds.size,
      commands: bot.commands.length,
      uptime: botUptime,
    });

    const moduleString = string("general.ABOUT_MODULES_STRING", {
      botVersion: botVersion,
      erisVersion: erisVersion,
      nodeVersion: process.version,
      tsVersion: tsVersion,
    });

    const hostString = string("general.ABOUT_HOST_STRING", {
      botMemoryUsage: botMemoryUsage,
      hostMemoryUsage: hostMemoryUsage,
      uptime: hostUptime,
      platform: hostPlatform,
    });

    msg.channel.createMessage({
      embed: {
        title: string("general.ABOUT_TITLE"),
        description: string("general.ABOUT_DESCRIPTION", { username: bot.user.username }),
        color: bot.convertHex("general"),
        fields: [
          {
            name: string("general.ABOUT_STATISTICS"),
            value: statisticsString,
            inline: true,
          },
          {
            name: string("general.ABOUT_MODULES"),
            value: moduleString,
            inline: true,
          },
          {
            name: string("general.ABOUT_HOST"),
            value: hostString,
            inline: false,
          },
        ],
        thumbnail: {
          url: bot.user.dynamicAvatarURL(),
        },
        footer: {
          text: string("global.RAN_BY_FOOTER", { author: bot.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

export default new aboutCommand();
