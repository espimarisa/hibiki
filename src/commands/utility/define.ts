import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import axios from "axios";

export class DefineCommand extends Command {
  description = "Gives a definition for a word from the Merriam-Webster dictionary.";
  requiredkeys = ["dictionary"];
  args = "<word:string>";
  aliases = ["defineword", "dict", "dictionary"];
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[], args: string[]) {
    const word = encodeURIComponent(args.join(" "));
    const key = this.bot.config.keys.dictionary;
    const body = await axios.get(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${key}`).catch(() => {});

    // If nothing is found
    if (!body || !body.data || !body.data?.[0]?.meta) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("utility.WORD_NOTFOUND"), "error");
    }

    // Gets the results
    const results = body.data[0];

    // Sends the definition
    msg.channel.createMessage({
      embed: {
        title: `📕 ${args.join(" ")}`,
        color: msg.convertHex("general"),
        fields: [
          {
            name: msg.string("global.CATEGORY"),
            value: `${results.fl || msg.string("global.NONE")}`,
            inline: true,
          },
          {
            name: msg.string("utility.WORD_STEMS"),
            value: `${results.meta?.stems ? `${results.meta.stems.map((r: string) => `\`${r}\``).join(", ")}` : msg.string("global.NONE")}`,
            inline: false,
          },
          {
            name: msg.string("utility.WORD_DEFINITION"),
            value: `${results.shortdef[0] || msg.string("global.NONE")}`,
            inline: false,
          },
        ],
        footer: {
          text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
