import { Message, TextChannel } from "eris";
import { Command, CommandCategories, LocaleString } from "../../classes/Command";
import { HibikiClient } from "../../classes/Client";
import axios from "axios";

class DuckCommand extends Command {
  name = "duck";
  category = CommandCategories.IMAGE;
  description = "Sends a random picture of a duck.";
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, string: LocaleString, bot: HibikiClient) {
    const body = await axios.get("https://random-d.uk/api/v1/random");

    msg.channel.createMessage({
      embed: {
        title: string("image.DUCK_TITLE"),
        color: bot.convertHex("general"),
        image: {
          url: body.data.url,
        },
        footer: {
          text: string("image.DUCK_FOOTER", { author: bot.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

export default new DuckCommand();
