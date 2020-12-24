import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import axios from "axios";

export class CatCommand extends Command {
  aliases = ["kitten", "kitty"];
  description = "Sends a random picture of a cat.";
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>) {
    // TODO: Add an global Exception handler
    const body = await axios.get("http://aws.random.cat/meow");

    msg.channel.createMessage({
      embed: {
        title: `🐱 ${msg.string("image.CAT")}`,
        color: msg.convertHex("general"),
        image: {
          url: body.data.file,
        },

        footer: {
          text: msg.string("global.RAN_BY", {
            author: this.bot.tagUser(msg.author),
            poweredBy: "random.cat",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
