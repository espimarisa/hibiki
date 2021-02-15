import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export abstract class emojiCommand extends Command {
  aliases = ["emote", "enlarge"];
  args = "<emoji:string>";
  description = "Enlarges an emoji.";

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    // Finds the emoji and if it's animated or not
    const emoji = args.join("").match(/(?<=<a?:.*:)\d*(?=>)/);
    const animated = /<[a]:/g.test(args.join(""));

    // Unicode to emoji
    function toEmoji(string: string) {
      const characters = [];
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
    if (!emoji || isNaN(emoji as any)) {
      if (/\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]/.test(args[0])) {
        return msg.channel.createMessage({
          embed: {
            title: "😄 Emoji",
            color: msg.convertHex("general"),
            image: {
              url: `https://twemoji.maxcdn.com/v/13.0.0/72x72/${toEmoji(args[0])}.png`,
            },
            footer: {
              text: `Ran by ${msg.tagUser(msg.author)}`,
              icon_url: msg.author.dynamicAvatarURL(),
            },
          },
        });
      }

      return msg.createEmbed("❌ Error", "No **emoji** was provided.", "error");
    }

    // Custom emoji
    msg.channel.createMessage({
      embed: {
        title: "😄 Emoji",
        color: msg.convertHex("general"),
        image: {
          url: `https://cdn.discordapp.com/emojis/${emoji}.${animated ? "gif" : "png"}`,
        },
        footer: {
          text: `Ran by ${msg.tagUser(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
