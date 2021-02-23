import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import axios from "axios";

export class XKCDCommand extends Command {
  description = "Sends a random or specified comic from XKCD.";
  args = "[id:string] | [today:string]";
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const comic = encodeURIComponent(args.join(""));
    let api = "";

    // Daily comic
    if (comic === "today" || comic === "daily") api = "https://xkcd.com/info.0.json";
    // Specified comic
    else if (args.length) api = `https://xkcd.com/${comic}/info.0.json`;
    // Random comic
    else {
      const body = await axios.get("https://xkcd.com/info.0.json").catch(() => {});
      if (!body || !body.data.num) return msg.createEmbed(msg.string("global.ERROR"), msg.string("fun.XKCD_ERROR"), "error");
      const random = Math.floor(Math.random() * body.data.num) + 1;
      api = `https://xkcd.com/${random}/info.0.json`;
    }

    // Gets the comic
    const body = await axios.get(api).catch(() => {});
    if (!body || !body.data.num) return msg.createEmbed(msg.string("global.ERROR"), msg.string("fun.XKCD_ERROR"), "error");

    // Sends the comic
    msg.channel.createMessage({
      embed: {
        title: `💬 ${body.data.safe_title}`,
        description: `${body.data.alt}`,
        color: msg.convertHex("general"),
        image: {
          url: body.data.img,
        },
        footer: {
          text: msg.string("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            extra: `${body.data.month}/${body.data.day}/${body.data.year}`,
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
