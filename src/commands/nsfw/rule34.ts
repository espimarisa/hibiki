import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { videoFileRegex } from "../../helpers/constants";
import axios from "axios";

export class Rule34Command extends Command {
  aliases = ["paheal", "r34"];
  args = "[tags:string]";
  description = "Searches for an image from Rule 34 or sends a random one.";
  cooldown = 3000;
  nsfw = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const query = encodeURIComponent(args.join(" ").toLowerCase());

    // Gets posts
    const body = await axios.get(`https://r34-json-api.herokuapp.com/posts?tags=${query}`).catch(() => {});

    // If nothing was found
    if (!body || !body.data?.[0]) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("global.RESERROR_IMAGEQUERY"), "error");
    }

    // Gets post and handles videos
    const random = Math.floor(Math.random() * body.data.length);
    if (videoFileRegex.test(body.data[random].sample_url)) {
      return msg.createEmbed(
        msg.string("global.ERROR"),
        msg.string("global.RESERROR_ATTACHMENT", { url: body.data[random].sample_url }),
        "error",
      );
    }

    msg.channel.createMessage({
      embed: {
        title: `🔞 ${msg.string("nsfw.RULE34")}`,
        color: msg.convertHex("general"),
        image: {
          url: body.data[random].sample_url,
        },
        footer: {
          text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
