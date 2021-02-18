import type { Message, TextChannel } from "eris";
import { defaultEmojiRegex, emojiIDArgRegex } from "../../helpers/constants";
import { Command } from "../../classes/Command";

export class EmojiCommand extends Command {
  aliases = ["emote", "enlarge"];
  args = "<emoji:string>";
  description = "Enlarges an emoji.";

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    // Finds the emoji and if it's animated or not
    const emoji = args.join("").match(emojiIDArgRegex);
    const animated = /<[a]:/g.test(args.join(""));

    // If no emoji exists
    if (!emoji && !defaultEmojiRegex.test(args[0])) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("utility.EMOJI_NOEMOJI"), "error");
    }

    // Unicode to emoji conversion
    function toEmoji(string: string) {
      const characters: string[] = [];
      let charCode = 0;
      let sgFix = 0;

      for (let i = 0; i < string.length; i++) {
        charCode = string.charCodeAt(i);
        if (sgFix) {
          characters.push((0x10000 + ((sgFix - 0xd800) << 10) + (charCode - 0xdc00)).toString(16));
          sgFix = 0;
        } else if (charCode >= 0xd800 && charCode <= 0xdbff) {
          sgFix = charCode;
        } else {
          characters.push(charCode.toString(16));
        }
      }

      return characters.join("-");
    }

    // Default unicode emojis
    if (!emoji) {
      if (defaultEmojiRegex.test(args[0])) {
        return msg.channel.createMessage({
          embed: {
            title: `${args[0]}`,
            color: msg.convertHex("general"),
            image: {
              url: `https://twemoji.maxcdn.com/v/13.0.0/72x72/${toEmoji(args[0])}.png`,
            },
            footer: {
              text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
              icon_url: msg.author.dynamicAvatarURL(),
            },
          },
        });
      }
    }

    // Custom emoji
    msg.channel.createMessage({
      embed: {
        title: `${args[0]}`,
        color: msg.convertHex("general"),
        image: {
          url: `https://cdn.discordapp.com/emojis/${emoji}.${animated ? "gif" : "png"}`,
        },
        footer: {
          text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
