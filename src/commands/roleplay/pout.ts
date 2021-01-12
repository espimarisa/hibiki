import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import config from "../../../config.json";
import axios from "axios";

export class PoutCommand extends Command {
  description = "Posts a gif of you pouting.";
  cooldown = 3000;

  async run(msg: Message<TextChannel>) {
    const body = await axios.get("https://api.weeb.sh/images/random?type=pout", {
      headers: {
        "Authorization": `Wolke ${config.keys.weebsh}`,
        "User-Agent": "hibiki",
      },
    });

    let image: string;
    if (body.status !== 200) image = "https://cdn.weeb.sh/images/r1WMmLQvW.gif";
    else if (body.status === 200) image = body.data.url;

    msg.channel.createMessage({
      embed: {
        description: `💢 ${msg.string("roleplay.POUT", { user: msg.author.username })}`,
        color: msg.convertHex("general"),
        image: {
          url: image,
        },
        footer: {
          text: msg.string("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            poweredBy: "weeb.sh",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
