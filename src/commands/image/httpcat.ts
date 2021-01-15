import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

const statusCodes = [
  "100",
  "101",
  "200",
  "201",
  "202",
  "204",
  "206",
  "207",
  "300",
  "301",
  "302",
  "303",
  "304",
  "305",
  "307",
  "400",
  "401",
  "402",
  "403",
  "404",
  "405",
  "406",
  "408",
  "409",
  "410",
  "411",
  "412",
  "413",
  "414",
  "415",
  "416",
  "417",
  "418",
  "420",
  "421",
  "422",
  "423",
  "424",
  "425",
  "426",
  "429",
  "431",
  "444",
  "450",
  "451",
  "499",
  "500",
  "501",
  "502",
  "503",
  "504",
  "506",
  "507",
  "508",
  "509",
  "510",
  "511",
  "599",
];

export class HTTPCatCommand extends Command {
  description = "Sends a picture of a HTTP Status code cat.";
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs, args: string[]) {
    let code;
    const codeToFind = statusCodes.filter((code) => code === `${args.join("")}`);
    if (!codeToFind?.length) code = statusCodes[Math.floor(Math.random() * statusCodes.length)];
    else code = codeToFind;

    msg.channel.createMessage({
      embed: {
        title: `🐱 ${code}`,
        color: msg.convertHex("general"),
        image: {
          url: `https://http.cat/${code}.jpg`,
        },
        footer: {
          text: msg.string("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            poweredBy: "http.cat",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
