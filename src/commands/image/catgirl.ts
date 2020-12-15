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

  async run(msg: Message<TextChannel>, string: LocaleString, bot: HibikiClient) {
    const body = await axios.get("https://nekos.life/api/v2/img/neko");

    msg.channel.createMessage({
      embed: {
        title: string("image.CATGIRL_TITLE"),
        color: bot.convertHex("general"),
        image: {
          url: body.data.url,
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
