import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { resError } from "../../utils/exception";
import axios from "axios";

export class SpacephotoCommand extends Command {
  description = "Sends a space image from NASAs database.";
  args = "[query:string]";
  aliases = ["nasa", "nasaimage", "nasaimg"];
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs, args: string[]) {
    const query = encodeURIComponent(args.join(" "));
    const omsg = await msg.createEmbed(`${msg.string("image.SPACEPHOTO")}`, msg.string("global.PLEASE_WAIT"));

    // Gets the image
    const body = await axios.get(`https://images-api.nasa.gov/search?media_type=image&q=${query}`).catch((err) => {
      resError(err);
    });

    if (!body || !body.data?.collection?.items) {
      return omsg.editEmbed(msg.string("global.ERROR"), msg.string("global.RESERROR_IMAGEQUERY"), "error");
    }

    // Randomly picks and image and gets its description
    const images = body.data?.collection?.items;
    const data = images[Math.floor(Math.random() * images.length)];
    const description = data.data[0].description;
    if (!data) return omsg.editEmbed(msg.string("global.ERROR"), msg.string("global.RESERROR_IMAGE"), "error");

    omsg.edit({
      embed: {
        title: msg.string("image.SPACEPHOTO"),
        description: description.length > 2000 ? `${description.substring(0, 2000)}...` : description || null,
        color: msg.convertHex("general"),
        image: {
          url: data.links[0].href,
        },
      },
    });
  }
}
