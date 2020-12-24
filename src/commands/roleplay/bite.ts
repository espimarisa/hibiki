import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import config from "../../../config.json";
import axios from "axios";

export class BiteCommand extends Command {
  description = "Bangs your head on something.";
  aliases = ["headbang"];
  cooldown = 3000;

  async run(msg: Message<TextChannel>) {
    const body = await axios.get("https://api.weeb.sh/images/random?type=banghead", {
      headers: {
        "Authorization": `Wolke ${config.keys.weebsh}`,
        "User-Agent": "Hibiki",
      },
    });

    let image;
    if (body.status !== 200) image = "https://cdn.weeb.sh/images/rJRepkXoW.gif";
    else if (body.status === 200) image = body.data.url;

    msg.channel.createMessage({
      embed: {
        description: msg.string("roleplay.BANGHEAD", { user: msg.author.username }),
        color: msg.convertHex("general"),
        image: {
          url: image,
        },
        footer: {
          text: msg.string("global.RAN_BY", {
            author: this.bot.tagUser(msg.author),
            poweredBy: "weeb.sh",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
