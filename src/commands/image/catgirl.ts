import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import axios from "axios";

export class CatgirlCommand extends Command {
  aliases = ["neko"];
  description = "Sends a picture of a catgirl.";
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>) {
    const body = await axios.get("https://nekobot.xyz/api/image?type=neko");

    msg.channel.createMessage({
      embed: {
        title: `🐱 ${msg.string("image.CATGIRL")}`,
        color: msg.convertHex("general"),
        image: {
          url: body.data.message,
        },
        footer: {
          text: msg.string("global.RAN_BY", {
            author: this.bot.tagUser(msg.author),
            poweredBy: "api.nekobot.xyz",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
