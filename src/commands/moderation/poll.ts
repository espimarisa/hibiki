import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { urlRegex } from "../../utils/constants";

export class PollCommand extends Command {
  description = "Creates a poll that members can react to.";
  aliases = ["createpoll", "startpoll"];
  args = "<question:string>";
  requiredperms = ["manageMessages"];
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

    // Sends the poll
    const pollmsg = await msg.channel.createMessage({
      embed: {
        description: `${content}`,
        color: msg.convertHex("general"),
        author: {
          icon_url: msg.author.dynamicAvatarURL(),
          name: `${msg.string("moderation.POLL", { member: msg.tagUser(msg.author) })}`,
        },
        thumbnail: {
          url: `${imgurl || ""}`,
        },
        footer: {
          text: `${msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) })}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });

    // Adds poll reactions
    await pollmsg.addReaction("👍").catch(() => {});
    await pollmsg.addReaction("👎").catch(() => {});
  }
}
