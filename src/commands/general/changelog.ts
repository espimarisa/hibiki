import { Message, TextChannel } from "eris";
import { Command, CommandCategories, LocaleString } from "../../classes/Command";
import { HibikiClient } from "../../classes/Client";

class ChangelogCommand extends Command {
  name = "changelog";
  category = CommandCategories.GENERAL;
  aliases = ["cl", "clog", "updates", "whatsnew"];
  description = "Sends the latest version's changelog.";
  allowdms = true;

  run(msg: Message<TextChannel>, bot: HibikiClient, string: LocaleString) {
    msg.channel.createMessage({
      embed: {
        title: string("general.CHANGELOG_TITLE"),
        description: string("general.CHANGELOG_DESCRIPTION"),
        color: bot.convertHex("general"),
        footer: {
          text: string("global.RAN_BY_FOOTER", { author: bot.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

export default new ChangelogCommand();
