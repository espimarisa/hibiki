/**
 * @file Changelog command
 * @description Sends the latest version's changelog
 */

import type { Message, TextChannel } from "eris";

import { Command } from "../../classes/Command";

import axios from "axios";

export class ChangelogCommand extends Command {
  aliases = ["cl", "clog", "updates", "whatsnew"];
  description = "Sends the latest version's changelog.";
  requiredkeys = ["github"];
  allowdms = true;

  async run(msg: Message<TextChannel>) {
    // Gets the latest changelog
    const body = await axios
      .get("https://api.github.com/repos/sysdotini/hibiki/releases", {
        headers: {
          "Accept": "application/vnd.github.v3+json",
          "User-Agent": `${this.bot.user.username}`,
          "Authorization": `Token ${this.bot.config.keys.github}`,
        },
      })
      .catch(() => {});

    // If the changelog has no data or wasn't found
    if (!body || !body.data || !body.data?.[0]?.body) {
      return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("utility.GITHUB_ERROR"), "error");
    }

    // Splits the changelog body into lines
    const parsedLog: string[] = [];
    const changelog: string[] = body.data[0].body.split("\r\n");
    const title = changelog.shift().replace("# ", "");

    // Parses and formats MD
    changelog.forEach((line) => {
      if (line.startsWith("# ")) {
        parsedLog.push(`**${line.substring(2, line.length)}**`);
      } else if (line.startsWith("## ") && !line.startsWith("# ")) {
        parsedLog.push(`__**${line.substring(3, line.length)}**__`);
      } else if (line.startsWith("### ") && !line.startsWith("## ") && !line.startsWith("# ")) {
        parsedLog.push(line.substring(4, line.length));
      } else if (line.startsWith("  - ")) {
        parsedLog.push(`\u200b \u200b ○ ${line.substring(4)}`);
      } else if (line.startsWith("- ")) parsedLog.push(`● ${line.substring(2)}`);
      else parsedLog.push(line);
    });

    let joinedLog = parsedLog.join("\n");
    if (joinedLog.length > 2000) joinedLog = `${joinedLog.substring(0, 2000)}...`;

    // Sends the changelog
    msg.channel.createMessage({
      embed: {
        description: `${joinedLog}`,
        color: msg.convertHex("general"),
        author: {
          url: `${body.data[0].html_url}`,
          name: `${title}`,
          icon_url: this.bot.user.dynamicAvatarURL(),
        },
        footer: {
          text: msg.locale("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
