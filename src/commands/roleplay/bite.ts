import type { Member, Message, TextChannel } from "eris";
import type { WeebSHImage } from "../../typings/endpoints";
import { Command } from "../../classes/Command";
import axios from "axios";

export class BiteCommand extends Command {
  args = "<member:member>";
  description = "Bites someone else.";
  cooldown = 3000;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[]) {
    const member = pargs[0].value as Member;
    const body = (await axios
      .get("https://api.weeb.sh/images/random?type=bite", {
        headers: {
          "Authorization": `Wolke ${this.bot.config.keys.weebsh}`,
          "User-Agent": "hibiki",
        },
      })
      .catch(() => {})) as WeebSHImage;

    let image = "";
    if (!body || !body?.data?.url) image = "https://cdn.weeb.sh/images/ry3pQGraW.gif";
    else image = body.data.url;

    msg.channel.createMessage({
      embed: {
        description: `♥ ${msg.string("roleplay.BITE", { user: msg.author.username, member: member.user.username })}`,
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
