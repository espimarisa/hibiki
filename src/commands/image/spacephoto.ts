import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import axios from "axios";

export class SpacephotoCommand extends Command {
  description = "Sends a space image from NASAs database.";
  args = "[query:string]";
  aliases = ["nasa", "nasaimage", "nasaimg"];
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[], args: string[]) {
    const query = encodeURIComponent(args.join(" "));
    const omsg = await msg.createEmbed(`${msg.locale("image.SPACEPHOTO")}`, msg.locale("global.PLEASE_WAIT"));

    // Gets the image
    const body = await axios.get(`https://images-api.nasa.gov/search?media_type=image&q=${query}`).catch(() => {});

    if (!body || !body.data?.collection?.items) {
      return omsg.editEmbed(msg.locale("global.ERROR"), msg.locale("global.RESERROR_IMAGEQUERY"), "error");
    }

    // Randomly picks and image and gets its description
    const images = body.data?.collection?.items;
    const data = images[Math.floor(Math.random() * images.length)];
    const description = data.data?.[0].description;
    if (!data) return omsg.editEmbed(msg.locale("global.ERROR"), msg.locale("global.RESERROR_IMAGE"), "error");

    omsg.edit({
      embed: {
        title: msg.locale("image.SPACEPHOTO"),
        description: description.length > 2000 ? `${description.substring(0, 2000)}...` : description || null,
        color: msg.convertHex("general"),
        image: {
          url: data.links?.[0]?.href,
        },
        footer: {
          text: msg.locale("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            poweredBy: "nasa.gov",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
