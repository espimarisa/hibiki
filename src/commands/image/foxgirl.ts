import { Message, TextChannel } from "eris";
import { Command, CommandCategories, LocaleString } from "../../classes/Command";
import { HibikiClient } from "../../classes/Client";
import axios from "axios";

class FoxgirlCommand extends Command {
  name = "foxgirl";
  category = CommandCategories.IMAGE;
  aliases = ["kitsune"];
  description = "Sends a picture of a foxgirl.";
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, string: LocaleString, bot: HibikiClient) {
    const body = await axios.get("https://nekos.life/api/v2/img/fox_girl");

    msg.channel.createMessage({
      embed: {
        title: string("image.FOXGIRL_TITLE"),
        color: bot.convertHex("general"),
        image: {
          url: body.data.url,
        },
        footer: {
          text: string("image.FOXGIRL_FOOTER", { author: bot.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

export default new FoxgirlCommand();
