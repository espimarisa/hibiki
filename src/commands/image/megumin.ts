import type { Message, TextChannel } from "eris";
import type { WeebSHImage } from "../../typings/endpoints";
import { Command } from "../../classes/Command";
import axios from "axios";

export class MeguminCommand extends Command {
  aliases = ["megu"];
  description = "Sends a random GIF of Megumin.";
  cooldown = 3000;

  async run(msg: Message<TextChannel>) {
    const body = (await axios
      .get("https://api.weeb.sh/images/random?type=megumin", {
        headers: {
          "Authorization": `Wolke ${this.bot.config.keys.weebsh}`,
          "User-Agent": "hibiki",
        },
      })
      .catch(() => {})) as WeebSHImage;

    let image = "";
    if (!body || !body?.data?.url) image = "https://cdn.weeb.sh/images/ry8LxA_wZ.gif";
    else image = body.data.url;

    msg.channel.createMessage({
      embed: {
        description: `💥 ${msg.string("image.MEGUMIN")}`,
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
