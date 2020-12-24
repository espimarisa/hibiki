import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import axios from "axios";

export class FoxCommand extends Command {
  description = "Sends a random picture of a fox.";
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>) {
    const body = await axios.get("https://randomfox.ca/floof/");

    msg.channel.createMessage({
      embed: {
        title: `🦊 ${msg.string("image.FOX")}`,
        color: msg.convertHex("general"),
        image: {
          url: body.data.image,
        },
        footer: {
          text: msg.string("global.RAN_BY", {
            author: this.bot.tagUser(msg.author),
            poweredBy: "randomfox.ca",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
