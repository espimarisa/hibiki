import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { resError } from "../../utils/exception";
import axios from "axios";

export class DuckCommand extends Command {
  description = "Sends a random picture of a duck.";
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>) {
    const body = await axios.get("https://random-d.uk/api/v2/random").catch((err) => {
      resError(err);
    });

    if (!body || !body.data?.url) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("global.RESERROR_IMAGE"), "error");
    }

    msg.channel.createMessage({
      embed: {
        title: `🦆 ${msg.string("image.DUCK")}`,
        color: msg.convertHex("general"),
        image: {
          url: body.data.url,
        },
        footer: {
          text: msg.string("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            poweredBy: "random-d.uk",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
