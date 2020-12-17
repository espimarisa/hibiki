import { Message, TextChannel } from "eris";
import { Command, CommandCategories, LocaleString } from "../../classes/Command";
import { HibikiClient } from "../../classes/Client";
import axios from "axios";

class CatgirlCommand extends Command {
  name = "catgirl";
  category = CommandCategories.IMAGE;
  aliases = ["neko"];
  description = "Sends a picture of a catgirl.";
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, bot: HibikiClient, string: LocaleString) {
    const body = await axios.get("https://nekobot.xyz/api/image?type=neko");

    msg.channel.createMessage({
      embed: {
        title: string("image.CATGIRL_TITLE"),
        color: bot.convertHex("general"),
        image: {
          url: body.data.message,
        },
        footer: {
          text: string("image.CATGIRL_FOOTER", { author: bot.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

export default new CatgirlCommand();
