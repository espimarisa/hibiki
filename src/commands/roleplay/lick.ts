import type { Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import config from "../../../config.json";
import axios from "axios";

export class LickCommand extends Command {
  args = "<member:member>";
  description = "Licks someeone else.";
  cooldown = 3000;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs) {
    const member = pargs[0].value as Member;
    const body = await axios
      .get("https://api.weeb.sh/images/random?type=lick", {
        headers: {
          Authorization: `Wolke ${config.keys.weebsh}`,
        },
      })
      .catch(() => {});

    let image: string;
    if (!body || !body?.data?.url) image = "https://cdn.weeb.sh/images/ryGpGsnAZ.gif";
    else image = body.data.url;

    msg.channel.createMessage({
      embed: {
        description: `💚 ${msg.string("roleplay.LICK", { user: msg.author.username, member: member.user.username })}`,
        color: msg.convertHex("general"),
        image: {
          url: image,
        },
        footer: {
          text: msg.string("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            poweredBy: "weeb.sh",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
