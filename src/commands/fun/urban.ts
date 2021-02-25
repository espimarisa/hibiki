import type { EmbedField, Message, TextChannel } from "eris";
import type { UrbanWord } from "../../typings/endpoints";
import { Command } from "../../classes/Command";
import { dateFormat } from "../../utils/format";
import axios from "axios";

export class UrbanCommand extends Command {
  description = "Returns a definition from the Urban Dictionary.";
  args = "<word:string>";
  aliases = ["urbandic", "urbandictionary"];
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const query = encodeURIComponent(args.join(" "));

    // Gets the main body
    const body = await axios.get(`http://api.urbandictionary.com/v0/define?term=${query}`).catch(() => {});

    // If no word is found
    if (!body || !body.data || !body.data?.list || body?.data?.error) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("fun.URBAN_NOTFOUND"), "error");
    }

    // Finds the top word
    const topword = body.data.list?.sort?.((a: UrbanWord, b: UrbanWord) => b?.thumbs_up - a?.thumbs_up);
    const word = topword[0] as UrbanWord;

    // If the word has no definition
    if (!topword || !word || !word?.definition) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("fun.URBAN_NOTFOUND"), "error");
    }

    // Cleans up definitions & examples
    word.definition = topword[0].definition.replace(/[[\]]/g, "");
    word.example = topword[0].example.replace(/[[\]]/g, "");
    if (word.definition.length > 1024) {
      const fullstop = word.definition.slice(0, 1024).lastIndexOf(".");
      word.definition = word.definition.slice(0, fullstop + 1);
    }

    const fields: EmbedField[] = [];

    // Example
    if (word.example) {
      fields.push({
        name: msg.string("fun.URBAN_EXAMPLE"),
        value: `${word.example}`,
        inline: false,
      });
    }

    if (word.written_on) {
      fields.push({
        name: msg.string("fun.URBAN_WRITTENON"),
        value: dateFormat(word.written_on, msg.string),
        inline: false,
      });
    }

    // Thumbs up
    if (word.thumbs_up) {
      fields.push({
        name: msg.string("global.UPVOTES"),
        value: `${word.thumbs_up}`,
        inline: true,
      });
    }

    // Thumbs down
    if (word.thumbs_down) {
      fields.push({
        name: msg.string("global.DOWNVOTES"),
        value: `${word.thumbs_down}`,
        inline: true,
      });
    }

    // Sends the definition
    msg.channel.createMessage({
      embed: {
        title: `📔 ${word.word}`,
        description: word.definition,
        color: msg.convertHex("general"),
        fields: fields,
        footer: {
          text: `${msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) })}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
