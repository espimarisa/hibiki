import type { Message } from "eris";
import { Command } from "../../classes/Command";
import axios from "axios";

export class FoxgirlCommand extends Command {
  aliases = ["kitsune"];
  description = "Sends a picture of a foxgirl.";
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message) {
    const body = await axios.get("https://nekos.life/api/v2/img/fox_girl");

    msg.channel.createMessage({
      embed: {
        title: `🦊 ${msg.string("image.FOXGIRL_TITLE")}`,
        color: msg.convertHex("general"),
        image: {
          url: body.data.url,
        },
        footer: {
          text: msg.string("global.RAN_BY", {
            author: this.bot.tagUser(msg.author),
            poweredBy: "nekos.life",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
