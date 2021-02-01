import type { Message } from "eris";
import { Command } from "../../classes/Command";
import { resError } from "../../utils/exception";
import axios from "axios";

export class FoxgirlCommand extends Command {
  aliases = ["kitsune"];
  description = "Sends a picture of a foxgirl.";
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message) {
    const body = await axios.get("https://nekos.life/api/v2/img/fox_girl").catch((err) => {
      resError(err);
    });

    if (!body || !body.data?.url) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("global.RESERROR_IMAGE"), "error");
    }

    msg.channel.createMessage({
      embed: {
        title: `🦊 ${msg.string("image.FOXGIRL")}`,
        color: msg.convertHex("general"),
        image: {
          url: body.data.url,
        },
        footer: {
          text: msg.string("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            poweredBy: "nekos.life",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
