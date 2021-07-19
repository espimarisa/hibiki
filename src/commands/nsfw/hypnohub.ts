import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { blacklistedTags, videoFileRegex } from "../../utils/constants";
import axios from "axios";

export class HypnohubCommand extends Command {
  aliases = ["hypno"];
  args = "[tags:string]";
  description = "Searches for an image from Hypnohub or sends a random one.";
  nsfw = true;
  cooldown = 3000;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const query = encodeURIComponent(args.join(" ").toLowerCase());

    // Gets posts
    const body = await axios.get(`https://hypnohub.net/post.json?api_version=2&tags=${query}`).catch(() => {});

    if (!body || !body.data.posts?.length) {
      return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("global.RESERROR_IMAGEQUERY"), "error");
    }

    // Gets post
    const random = Math.floor(Math.random() * body.data.posts.length);

    // Blacklists bad posts
    if (body.data.posts[random].rating !== "s" && !blacklistedTags.every((t) => !body.data.posts[random]?.tags?.split(" ")?.includes(t))) {
      return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("global.RESERROR_IMAGEQUERY"), "error");
    }

    // Handles videos
    if (videoFileRegex.test(body.data.posts[random].sample_url)) {
      return msg.createEmbed(
        msg.locale("global.ERROR"),
        msg.locale("global.RESERROR_ATTACHMENT", { url: body.data.posts[random].sample_url }),
        "error",
      );
    }

    msg.channel.createMessage({
      embed: {
        title: `🔞 ${msg.locale("nsfw.HYPNOHUB")}`,
        color: msg.convertHex("general"),
        image: {
          url: body.data.posts[random].sample_url,
        },
        footer: {
          text: msg.locale("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            poweredBy: "hypnohub.net",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
