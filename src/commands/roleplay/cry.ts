import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import config from "../../../config.json";
import axios from "axios";

export class CryCommand extends Command {
  description = "Posts a gif of you crying.";
  cooldown = 3000;

  async run(msg: Message<TextChannel>) {
    const body = await axios
      .get("https://api.weeb.sh/images/random?type=cry", {
        headers: {
          Authorization: `Wolke ${config.keys.weebsh}`,
        },
      })
      .catch(() => {});

    let image: string;
    if (!body || !body?.data?.url) image = "https://cdn.weeb.sh/images/r1WMmLQvW.gif";
    else image = body.data.url;

    msg.channel.createMessage({
      embed: {
        description: `😢 ${msg.string("roleplay.CRY", { user: msg.author.username })}`,
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
