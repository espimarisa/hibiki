import type { Message, TextChannel, User } from "eris";
import { Command } from "../../classes/Command";
import { ISOcodes } from "../../utils/constants";
import axios from "axios";

export class TranslateCommand extends Command {
  description = "Translates text between languages.";
  args = "[language:string] [text:string]";
  cooldown = 3000;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[], easyTranslate = false, easyTranslateUser?: User) {
    // If nothing was given
    if (!args.length) return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("utility.TRANSLATE_NOTEXT"), "error");
    let locale = "en";

    // Adjusts some locales
    if (args[0].toLowerCase().startsWith("se")) {
      locale = "sv";
      args.shift();
    } else if (args[0].toLowerCase().startsWith("cz")) {
      locale = "cs";
      args.shift();
    } else if (args[0].toLowerCase().startsWith("jp")) {
      locale = "ja";
      args.shift();
    } else if (args[0].toLowerCase().startsWith("br")) {
      locale = "pt";
      args.shift();
    } else if (args[0].toLowerCase().startsWith("gb") || args[0].toLowerCase().startsWith("us")) {
      locale = "en";
      args.shift();
    }

    // Adjusts locale
    if (ISOcodes.includes(args?.[0]?.toLowerCase())) {
      locale = args?.shift()?.toLowerCase();
    }

    // Gets translation
    const query = encodeURIComponent(args.join(" "));
    const body = await axios
      .get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${locale}&dt=t&q=${query}`)
      .catch(() => {});

    // If nothing was found
    if (!body || !body.data || !body.data?.[0]?.[0]?.[1] || !body.data?.[2]) {
      return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("utility.TRANSLATE_NOTRANSLATION"), "error");
    }

    // Sends the translation
    msg.channel.createMessage({
      embed: {
        title: `🌍 ${easyTranslate ? msg.locale("utility.EASYTRANSLATE") : msg.locale("utility.TRANSLATE")}`,
        description: `${msg.locale("utility.TRANSLATE_DESCRIPTION", {
          oldcontent: body.data[0][0][1],
          content: body.data[0][0][0],
        })}`,
        color: msg.convertHex("general"),
        footer: {
          text: `${msg.locale("utility.TRANSLATE_FOOTER", {
            author: easyTranslate && easyTranslateUser ? msg.tagUser(easyTranslateUser) : msg.tagUser(msg.author),
            from: body.data[2].toUpperCase(),
            to: locale.toUpperCase(),
          })}`,
          icon_url: easyTranslate && easyTranslateUser ? easyTranslateUser.dynamicAvatarURL() : msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
