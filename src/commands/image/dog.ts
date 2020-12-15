import { Message, TextChannel } from "eris";
import { Command, CommandCategories, LocaleString } from "../../classes/Command";
import { HibikiClient } from "../../classes/Client";
import axios from "axios";

class DogCommand extends Command {
  name = "dog";
  category = CommandCategories.IMAGE;
  aliases = ["puppy"];
  description = "Sends a random picture of a dog.";
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, string: LocaleString, bot: HibikiClient) {
    const body = await axios.get("https://random.dog/woof.json");

    msg.channel.createMessage({
      embed: {
        title: string("image.DOG_TITLE"),
        color: bot.convertHex("general"),
        image: {
          url: body.data.url,
        },
        footer: {
          text: string("image.DOG_FOOTER", { author: bot.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

export default new DogCommand();
