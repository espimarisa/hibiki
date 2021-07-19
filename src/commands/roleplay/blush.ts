import type { Message, TextChannel } from "eris";
import type { WeebSHImage } from "../../typings/endpoints";
import { Command } from "../../classes/Command";
import axios from "axios";

export class BlushCommand extends Command {
  description = "Posts a gif of you blushing.";
  cooldown = 3000;

  async run(msg: Message<TextChannel>) {
    const body = (await axios
      .get("https://api.weeb.sh/images/random?type=blush", {
        headers: {
          "Authorization": `Wolke ${this.bot.config.keys.weebsh}`,
          "User-Agent": "hibiki",
        },
      })
      .catch(() => {})) as WeebSHImage;

    let image = "";
    if (!body || !body?.data?.url) image = "https://cdn.weeb.sh/images/rJa-zUmv-.gif";
    else image = body.data.url;

    msg.channel.createMessage({
      embed: {
        description: `🧡 ${msg.locale("roleplay.BLUSH", { user: msg.author.username })}`,
        color: msg.convertHex("general"),
        image: {
          url: image,
        },
        footer: {
          text: msg.locale("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            poweredBy: "weeb.sh",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
