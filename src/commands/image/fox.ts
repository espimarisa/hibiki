import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import axios from "axios";

export class FoxCommand extends Command {
  description = "Sends a random picture of a fox.";
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>) {
    const body = await axios.get("https://randomfox.ca/floof/").catch(() => {});

    if (!body || !body.data?.image) {
      return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("global.RESERROR_IMAGE"), "error");
    }

    msg.channel.createMessage({
      embed: {
        title: `🦊 ${msg.locale("image.FOX")}`,
        color: msg.convertHex("general"),
        image: {
          url: body.data.image,
        },
        footer: {
          text: msg.locale("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            poweredBy: "randomfox.ca",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
