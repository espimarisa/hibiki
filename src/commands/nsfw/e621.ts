import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { blacklistedTags, videoFileRegex } from "../../utils/constants";
import axios from "axios";

export class e621Command extends Command {
  aliases = ["e6"];
  args = "[tags:string]";
  description = "Searches for an image from e621 or sends a random one.";
  nsfw = true;
  cooldown = 3000;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const query = encodeURIComponent(args.join(" ").toLowerCase());

    // Gets posts
    const body = await axios
      .get(`https://e621.net/posts.json?&s=post&q=index&json=1?limit=200&tags=${query}`, {
        headers: {
          "User-Agent": "hibiki",
        },
      })
      .catch(() => {});

    // If nothing was found
    if (!body || !body?.data?.posts?.[0]?.file?.url || body?.data?.success === false) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("global.RESERROR_IMAGEQUERY"), "error");
    }

    // Gets post
    const random = Math.floor(Math.random() * body.data.posts.length);

    // Blacklists bad posts
    const tags = Object.values(body.data.posts[random]?.tags).flat();
    if (body.data.posts[random].rating !== "s" && !blacklistedTags.every((t) => !tags?.includes(t))) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("global.RESERROR_IMAGEQUERY"), "error");
    }

    // Handles videos
    if (videoFileRegex.test(body?.data?.posts?.[random]?.file?.url)) {
      return msg.createEmbed(
        msg.string("global.ERROR"),
        msg.string("global.RESERROR_ATTACHMENT", { url: body.data.posts[random].file_url }),
        "error",
      );
    }

    // Sends the post
    msg.channel.createMessage({
      embed: {
        title: `${msg.string("nsfw.E621")}`,
        color: msg.convertHex("general"),
        image: {
          url: body.data.posts[random].file.url,
        },
        footer: {
          text: msg.string("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            poweredBy: "e621.net",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
