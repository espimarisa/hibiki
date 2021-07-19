import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class GarfieldCommand extends Command {
  description = "Send a random Garfield comic.";
  aliases = ["garf", "funnycat", "funnyjimdavis"];
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>) {
    function garfieldComic(latest = false) {
      const days = 24 * 60 * 60 * 1000;
      const today = new Date();
      const start = new Date("1978/06/19");
      let date;
      if (latest) date = new Date();
      else date = new Date(start.getTime() + Math.random() * (today.getTime() - start.getTime()));

      // Gets total amount of comics
      const total = Math.round(Math.abs((start.getTime() - today.getTime()) / days));
      function pad(n: number) {
        return n < 10 ? `0${n}` : n;
      }

      // Archive URL
      const archive = "http://images.ucomics.com/comics/ga/";
      const url = `${archive + date.getUTCFullYear()}/ga${date.getUTCFullYear().toString().slice(-2)}${pad(date.getUTCMonth() + 1)}${pad(
        date.getUTCDate(),
      )}.gif`;

      // Gets the image
      const garfield = [url, date.getUTCFullYear(), pad(date.getUTCMonth() + 1), pad(date.getUTCDate()), total];
      return garfield;
    }

    const garfield = garfieldComic();
    if (!garfield[0]) return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("global.RESERROR_IMAGE"), "error");

    msg.channel.createMessage({
      embed: {
        title: `💭 ${msg.locale("image.GARFIELD_PUBLISHEDON", { date: `${garfield[1]}-${garfield[2]}-${garfield[3]}` })}`,
        color: msg.convertHex("general"),
        image: {
          url: `${garfield[0]}`,
        },
        footer: {
          text: msg.locale("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            poweredBy: "images.ucomics.com",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
