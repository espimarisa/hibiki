import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import axios from "axios";

export class MemeCommand extends Command {
  description = "Sends a random meme.";
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>) {
    const body = await axios.get("https://meme-api.herokuapp.com/gimme").catch(() => {});

    if (!body || !body.data?.url) {
      return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("global.RESERROR_IMAGE"), "error");
    }

    msg.channel.createMessage({
      embed: {
        title: `🤣 ${msg.locale("image.MEME")}`,
        color: msg.convertHex("general"),
        image: {
          url: body.data.url,
        },
        footer: {
          text: msg.locale("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            poweredBy: "meme-api.herokuapp.com",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
