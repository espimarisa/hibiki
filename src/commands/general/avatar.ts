import { Message, TextChannel } from "eris";
import { Command, CommandCategories, LocaleString, ParsedArgs } from "../../classes/Command";
import { HibikiClient } from "../../classes/Client";

class AvatarCommand extends Command {
  name = "avatar";
  category = CommandCategories.GENERAL;
  args = "[member:member&fallback]";
  aliases = ["pfp", "profilepic", "profilepicture", "uicon", "usericon"];
  description = "Sends a member's profile picture.";

  run(msg: Message<TextChannel>, string: LocaleString, bot: HibikiClient, _args: string[], pargs: ParsedArgs) {
    const user = pargs[0].value;

    msg.channel.createMessage({
      embed: {
        color: bot.convertHex("general"),
        author: {
          icon_url: user.user.dynamicAvatarURL(),
          name: bot.tagUser(user.user),
        },
        image: {
          url: user.user.dynamicAvatarURL(null),
        },
        footer: {
          text: string("global.RAN_BY_FOOTER", { author: bot.tagUser(user.user) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

export default new AvatarCommand();
