import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class ChangelogCommand extends Command {
  aliases = ["cl", "clog", "updates", "whatsnew"];
  description = "Sends the latest version's changelog.";
  allowdms = true;

  async run(msg: Message<TextChannel>) {
    // TODO: In the future, make this return data from GitHub's release endpoint
    // Also, pagify it to go back in time

    msg.channel.createMessage({
      embed: {
        title: `📚 ${msg.string("general.CHANGELOG")}`,
        description: msg.string("general.CHANGELOG_DESCRIPTION"),
        color: msg.convertHex("general"),
        footer: {
          text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
