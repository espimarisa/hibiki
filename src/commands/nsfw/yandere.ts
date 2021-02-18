import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { videoFileRegex } from "../../helpers/constants";
import axios from "axios";

export class YandereCommand extends Command {
  aliases = ["yande", "yd"];
  args = "[tags:string]";
  description = "Sends an image from Yande.re.";
  nsfw = true;
  cooldown = 3;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const query = encodeURIComponent(args.join(" ").toLowerCase());

    // Gets posts
    const body = await axios.get(`https://yande.re/post.json?api_version=2&tags=${query}`).catch(() => {});

    // If nothing was found
    if (!body || !body.data.posts?.length) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("global.RESERROR_IMAGEQUERY"), "error");
    }

    // Gets post and handles videos
    const random = Math.floor(Math.random() * body.data.posts.length);
    if (videoFileRegex.test(body.data.posts[random].sample_url)) {
      return msg.createEmbed(
        msg.string("global.ERROR"),
        msg.string("global.RESERROR_ATTACHMENT", { url: body.data.posts[random].sample_url }),
        "error",
      );
    }

    msg.channel.createMessage({
      embed: {
        title: `🔞 ${msg.string("nsfw.YANDERE")}`,
        color: msg.convertHex("general"),
        image: {
          url: body.data.posts[random].sample_url,
        },
        footer: {
          text: msg.string("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            poweredBy: "yande.re",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
