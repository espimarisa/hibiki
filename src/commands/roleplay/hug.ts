import type { Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import config from "../../../config.json";
import axios from "axios";

export class HugCommand extends Command {
  args = "<member:member>";
  aliases = ["huggle"];
  description = "Gives someeone a hug.";
  cooldown = 3000;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs) {
    const member = pargs[0].value as Member;
    const body = await axios.get("https://api.weeb.sh/images/random?type=hug", {
      headers: {
        "Authorization": `Wolke ${config.keys.weebsh}`,
        "User-Agent": "hibiki",
      },
    });

    let image: string;
    if (body.status !== 200) image = "https://cdn.weeb.sh/images/SJfEks3Rb.gif";
    else if (body.status === 200) image = body.data.url;

    msg.channel.createMessage({
      embed: {
        description: `💜 ${msg.string("roleplay.HUG", { user: msg.author.username, member: member.user.username })}`,
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
