import type { Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class AvatarCommand extends Command {
  args = "[member:member&fallback]";
  aliases = ["pfp", "profilepic", "profilepicture", "uicon", "usericon"];
  description = "Sends a member's profile picture.";

  run(msg: Message<TextChannel>, pargs: ParsedArgs) {
    const member = pargs[0].value as Member;

    msg.channel.createMessage({
      embed: {
        color: msg.convertHex("general"),
        author: {
          icon_url: member.user.dynamicAvatarURL(),
          name: this.bot.tagUser(member.user),
        },
        image: {
          url: member.user.dynamicAvatarURL(null),
        },
        footer: {
          text: msg.string("global.RAN_BY", { author: this.bot.tagUser(member.user) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

// todo cleanup string emojis and names
