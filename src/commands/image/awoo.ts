import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import axios from "axios";

export class AwooCommand extends Command {
  aliases = ["momiji"];
  description = "Sends a picture of Momiji Inubashiri (awoo!).";
  cooldown = 3000;

  async run(msg: Message<TextChannel>) {
    const body = await axios
      .get("https://api.weeb.sh/images/random?type=awoo", {
        headers: {
          "Authorization": `Wolke ${this.bot.config.keys.weebsh}`,
          "User-Agent": "hibiki",
        },
      })
      .catch(() => {});

    let image = "";
    if (!body || !body?.data?.url) image = "https://cdn.weeb.sh/images/H1Kvalk9W.png";
    else image = body.data.url;

    msg.channel.createMessage({
      embed: {
        description: `🐺 ${msg.string("image.AWOO")}`,
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
