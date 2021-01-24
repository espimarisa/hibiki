import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { resError } from "../../utils/exception";
import axios from "axios";

export class YuriCommand extends Command {
  description = "Sends an ecchi/hentai yuri picture.";
  aliases = ["lewdyuri", "yurihentai"];
  cooldown = 4000;
  allowdms = true;
  nsfw = true;

  async run(msg: Message<TextChannel>) {
    const body = await axios.get("https://nekos.life/api/v2/img/yuri").catch((err) => {
      resError(err);
    });

    if (!body || !body.data?.url) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("global.RESERROR_IMAGE"), "error");
    }

    msg.channel.createMessage({
      embed: {
        title: `🏳️‍🌈 ${msg.string("nsfw.YURI")}`,
        color: msg.convertHex("general"),
        image: {
          url: body.data.url,
        },
        footer: {
          text: msg.string("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            poweredBy: "nekos.life",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
