/**
 * @file Cat command
 * @command
 */

import { Message, TextChannel } from "eris";
import { Command, CommandCategories, LocaleString } from "../../classes/Command";
import { HibikiClient } from "../../classes/Client";
import axios from "axios";

class CatCommand extends Command {
  name = "cat";
  category = CommandCategories.IMAGE;
  aliases = ["kitten", "kitty"];
  description = "Sends a random picture of a cat.";
  cooldown!: 3000;

  async run(msg: Message<TextChannel>, string: LocaleString, bot: HibikiClient): Promise<void> {
    // TODO: Add an global Exception handler
    const body = await axios.get("http://aws.random.cat/meow");

    msg.channel.createMessage({
      embed: {
        title: string("image.CAT_TITLE"),
        color: bot.convertHex("general"),
        image: {
          url: body.data.file,
        },
        footer: {
          text: string("image.CAT_FOOTER", { author: bot.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

export default new CatCommand();
