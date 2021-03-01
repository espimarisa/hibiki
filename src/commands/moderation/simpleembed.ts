import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { urlRegex } from "../../helpers/constants";

export class SimpleembedCommand extends Command {
  description = "Creates an embed.";
  requiredperms = ["manageMessages"];
  args = "<text:string>";
  staff = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    let content = args.join(" ");
    let imgurl: string;

    // Checks if an image URL was given
    const urlcheck = urlRegex.exec(content);
    if (urlcheck) content = content.slice(0, urlcheck.index).concat(content.slice(urlcheck.index + urlcheck[0].length, content.length));
    if (urlcheck) imgurl = urlcheck[0];
    if (!imgurl && msg.attachments?.[0]) imgurl = msg.attachments[0].proxy_url;
    if (!imgurl) imgurl = null;

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        description: `${content}`,
        color: msg.convertHex("general"),
        author: {
          icon_url: msg.author.dynamicAvatarURL(),
          name: `${msg.string("global.MEMBER_SAID", { member: msg.tagUser(msg.author) })}`,
        },
        image: {
          url: `${imgurl || ""}`,
        },
        footer: {
          text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
