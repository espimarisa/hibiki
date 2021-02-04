import type { AxiosResponse } from "axios";
import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import axios from "axios";
type saucenaoData = { header: { similarity: string; thumbnail: string; index_id: number; index_name: string; dupes: number } };

export class SauceNaoCommand extends Command {
  description = "Gets a source for an image from Saucenao.";
  args = "[url:string]";
  requiredkeys = ["saucenao"];
  aliases = ["sauce", "saucenoa"];
  cooldown = 3000;
  allowdms = true;
  nsfw = true;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[]) {
    // Gets the image
    const img = msg.attachments?.length ? msg.attachments[0].url : pargs[0].value;
    if (!img) return msg.createEmbed(msg.string("global.ERROR"), msg.string("nsfw.SAUCENAO_NOIMAGE"), "error");

    // Searches for it on saucenao
    const body = await axios.post(
      `https://saucenao.com/search.php?api_key=${this.bot.config.keys.saucenao}&output_type=2&db=999&url=${encodeURIComponent(img)}`,
    );

    // If nothing was found
    if (!body || !body?.data.results) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("nsfw.SAUCENAO_ERROR"), "error");
    }

    // Sorts the data
    body.data.results = body.data.results.sort((a: saucenaoData, b: saucenaoData) =>
      parseFloat(a.header.similarity) > parseFloat(b.header.similarity) ? -1 : 1,
    );

    // Image URLs
    let imgUrls: string[] = [];
    body.data.results.forEach((img: AxiosResponse) => {
      if (img.data?.ext_urls && imgUrls.length < 3) {
        imgUrls = imgUrls.concat(img.data?.ext_urls);
      }
    });

    console.log(body.data.results[0].header);

    // Sends the source embed
    msg.channel.createMessage({
      embed: {
        title: `🔎 ${msg.string("nsfw.SAUCENAO")}`,
        color: msg.convertHex("general"),
        description: `${msg.string("nsfw.SAUCENAO_SOURCES", { sources: imgUrls.join("\n") })}`,
        image: {
          url: `${body.data.results[0]?.header?.thumbnail ?? ""}`,
        },
        footer: {
          text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
