import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class ChangelogCommand extends Command {
  aliases = ["cl", "clog", "updates", "whatsnew"];
  description = "Sends the latest version's changelog.";
  allowdms = true;

  run(msg: Message<TextChannel>) {
    msg.channel.createMessage({
      embed: {
        title: `📚 ${msg.string("general.CHANGELOG")}`,
        description: msg.string("general.CHANGELOG_DESCRIPTION"),
        color: msg.convertHex("general"),
        footer: {
          text: msg.string("global.RAN_BY", { author: this.bot.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
