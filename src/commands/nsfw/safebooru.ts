import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { blacklistedTags, videoFileRegex } from "../../helpers/constants";
import axios from "axios";

export class SafebooruCommand extends Command {
  aliases = ["sb"];
  args = "[tags:string]";
  description = "Searches for an image from Safebooru or sends a random one.";
  cooldown = 3000;
  nsfw = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const query = encodeURIComponent(args.join(" ").toLowerCase());

    // Gets posts
    const body = await axios.get(`https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&tags=${query}`).catch(() => {});

    // If nothing was found
    if (!body || !body.data?.[0]?.image || !body.data?.[0]?.directory) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("global.RESERROR_IMAGEQUERY"), "error");
    }

    // Gets post
    const random = Math.floor(Math.random() * body.data.length);

    // Blacklists bad posts
    if (body.data[random].rating !== "safe" && !blacklistedTags.every((t) => !body.data[random]?.tags?.split(" ")?.includes(t))) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("global.RESERROR_IMAGEQUERY"), "error");
    }

    // Handles videos
    if (videoFileRegex.test(body.data[random].image)) {
      return msg.createEmbed(
        msg.string("global.ERROR"),
        msg.string("global.RESERROR_ATTACHMENT", { url: body.data[random].image }),
        "error",
      );
    }

    msg.channel.createMessage({
      embed: {
        title: `🖼 ${msg.string("nsfw.SAFEBOORU")}`,
        color: msg.convertHex("general"),
        image: {
          url: `https://safebooru.org/images/${body.data[random].directory}/${body.data[random].image}`,
        },
        footer: {
          text: msg.string("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            poweredBy: "safebooru.org",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
