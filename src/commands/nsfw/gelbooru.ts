import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { blacklistedTags, videoFileRegex } from "../../helpers/constants";
import axios from "axios";

export class GelbooruCommand extends Command {
  aliases = ["gb", "gel"];
  args = "[tags:string]";
  description = "Searches for an image from Gelbooru or sends a random one.";
  nsfw = true;
  cooldown = 3;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const query = encodeURIComponent(args.join(" ").toLowerCase());

    // Gets posts
    const body = await axios.get(`https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=${query}`).catch(() => {});

    // If nothing was found
    if (!body || !body.data[0].file_url) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("global.RESERROR_IMAGEQUERY"), "error");
    }

    // Gets post and handles videos
    const random = Math.floor(Math.random() * body.data.length);

    // Blacklists bad posts
    if (!blacklistedTags.every((t) => !body.data[random]?.tags?.split(" ")?.includes(t))) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("global.RESERROR_IMAGEQUERY"), "error");
    }

    if (videoFileRegex.test(body.data[random].file_url)) {
      return msg.createEmbed(
        msg.string("global.ERROR"),
        msg.string("global.RESERROR_ATTACHMENT", { url: body.data[random].file_url }),
        "error",
      );
    }

    msg.channel.createMessage({
      embed: {
        title: `🔞 ${msg.string("nsfw.GELBOORU")}`,
        color: msg.convertHex("general"),
        image: {
          url: body.data[random].file_url,
        },
        footer: {
          text: msg.string("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            poweredBy: "gelbooru.com",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
