import { Message, TextChannel } from "eris";
import { Command, CommandCategories, LocaleString } from "../../classes/Command";
import { HibikiClient } from "../../classes/Client";
import axios from "axios";

class LewdcatgirlCommand extends Command {
  name = "lewdcatgirl";
  description = "Send a NSFW image of a catgirl.";
  category = CommandCategories.NSFW;
  aliases = ["catgirlhentai", "nekohentai", "lewdneko"];
  cooldown = 4000;
  allowdms = true;
  nsfw = true;

  async run(msg: Message<TextChannel>, bot: HibikiClient, string: LocaleString) {
    const body = await axios.get("https://nekobot.xyz/api/image?type=hneko");

    msg.channel.createMessage({
      embed: {
        title: string("nsfw.LEWDCATGIRL_TITLE"),
        color: bot.convertHex("general"),
        image: {
          url: body.data.message,
        },
        footer: {
          text: string("nsfw.LEWDCATGIRL_FOOTER", { author: bot.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

export default new LewdcatgirlCommand();
