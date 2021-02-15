import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { videoFileRegex } from "../../helpers/constants";
import axios from "axios";

export abstract class DanbooruCommand extends Command {
  aliases = ["db", "donmai"];
  args = "[tags:string]";
  description = "Searches for an image from Danbooru or sends a random one.";
  nsfw = true;
  cooldown = 3000;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    // Danbooru only supports up to 2 tags at a time
    if (args.length > 2) return msg.createEmbed(msg.string("global.ERROR"), msg.string("nsfw.DANBOORU_TAGS"), "error");
    const query = encodeURIComponent(args.join(" ").toLowerCase());

    // Finds the posts
    // TODO: Filter TOS breaking stuff thru a regex. Block direct queries and also tags. i.e block loli
    const body = await axios.get(`https://danbooru.donmai.us/posts.json?&tags=${query}`).catch(() => {});

    // Sends if no posts
    if (!body || !body.data?.length || !body.data?.[0]?.file_url) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("global.RESERROR_IMAGEQUERY"), "error");
    }

    // Gets post and handles videos
    const random = Math.floor(Math.random() * body.data.length);
    if (videoFileRegex.test(body.data[random].file_url)) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("global.RESERROR_ATTACHMENT", { url: body.data[0].file_url }), "error");
    }

    // Sends the post
    msg.channel.createMessage({
      embed: {
        title: `🔞 ${msg.string("nsfw.DANBOORU")}`,
        color: msg.convertHex("general"),
        image: {
          url: body.data[random]?.file_url,
        },
        footer: {
          text: msg.string("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            poweredBy: "danbooru.donmai.us",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
