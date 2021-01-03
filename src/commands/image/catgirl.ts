import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { resError } from "../../utils/exception";
import axios from "axios";

export class CatgirlCommand extends Command {
  aliases = ["neko"];
  description = "Sends a picture of a catgirl.";
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>) {
    const body = await axios.get("https://nekobot.xyz/api/image?type=neko").catch((err) => {
      resError(err);
    });

    if (!body || !body.data?.message) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("global.RESERROR_IMAGE"), "error");
    }

    msg.channel.createMessage({
      embed: {
        title: `🐱 ${msg.string("image.CATGIRL")}`,
        color: msg.convertHex("general"),
        image: {
          url: body.data.message,
        },
        footer: {
          text: msg.string("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            poweredBy: "api.nekobot.xyz",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
