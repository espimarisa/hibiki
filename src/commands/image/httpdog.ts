import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

const statusCodes = [
  "100",
  "200",
  "201",
  "202",
  "203",
  "204",
  "206",
  "207",
  "208",
  "300",
  "301",
  "302",
  "303",
  "305",
  "306",
  "307",
  "308",
  "400",
  "401",
  "402",
  "403",
  "404",
  "405",
  "406",
  "407",
  "408",
  "409",
  "410",
  "411",
  "412",
  "413",
  "414",
  "416",
  "417",
  "418",
  "420",
  "423",
  "424",
  "425",
  "426",
  "429",
  "431",
  "444",
  "450",
  "451",
  "494",
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
];

export class HTTPDogCommand extends Command {
  description = "Sends a picture of a HTTP Status code dog.";
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    let code;
    const codeToFind = statusCodes.filter((code) => code === `${args.join("")}`);
    if (!codeToFind?.length) code = statusCodes[Math.floor(Math.random() * statusCodes.length)];
    else code = codeToFind;

    msg.channel.createMessage({
      embed: {
        title: `🐶 ${code}`,
        color: msg.convertHex("general"),
        image: {
          url: `https://httpstatusdogs.com/img/${code}.jpg`,
        },
        footer: {
          text: msg.locale("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            poweredBy: "httpstatusdogs.com",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
