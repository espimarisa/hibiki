import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import axios from "axios";

export class LewdcatgirlCommand extends Command {
  description = "Send a NSFW image of a catgirl.";
  aliases = ["catgirlhentai", "nekohentai", "lewdneko"];
  cooldown = 4000;
  allowdms = true;
  nsfw = true;

  async run(msg: Message<TextChannel>) {
    const body = await axios.get("https://nekobot.xyz/api/image?type=hneko");

    msg.channel.createMessage({
      embed: {
        title: `🐱 ${msg.string("nsfw.LEWDCATGIRL_TITLE")}`,
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
