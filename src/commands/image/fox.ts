import { Message, TextChannel } from "eris";
import { Command, CommandCategories, LocaleString } from "../../classes/Command";
import { HibikiClient } from "../../classes/Client";
import axios from "axios";

class FoxCommand extends Command {
  name = "fox";
  category = CommandCategories.IMAGE;
  description = "Sends a random picture of a fox.";
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, bot: HibikiClient, string: LocaleString) {
    const body = await axios.get("https://randomfox.ca/floof/");

    msg.channel.createMessage({
      embed: {
        title: string("image.FOX_TITLE"),
        color: bot.convertHex("general"),
        image: {
          url: body.data.image,
        },
        footer: {
          text: string("image.FOX_FOOTER", { author: bot.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

export default new FoxCommand();
