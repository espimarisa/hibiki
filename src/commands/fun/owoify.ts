/**
 * @file OwOify command
 * @description OwOify's provided text
 */

import type { Message, TextChannel } from "eris";

import { Command } from "../../classes/Command";

const FACES = ["(・`ω´・)", "OwO", "ouo", "UwU", "uwu", ">w<", "^w^"];

export class OwOifyCommand extends Command {
  description = "OwOify's some text.";
  args = "<text:string>";
  aliases = ["owo"];
  allowdms = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const owoify = (owo: string) => {
      // Replaces codeblocks
      if (owo.startsWith("```") && owo.endsWith("```")) {
        owo = owo
          .replace(/(?<!w)(?<!o)(?<!functi)o(?!o)(?!w)/gi, "owo")
          .replace(/(?<!w)(?<!u)u(?!u)(?!m)(?!w)/gi, "uwu")
          .replace(/[{}]/g, "♥")
          .replace(/array/gi, "awway")
          .replace(/boolean/gi, "buwulean");
      } else owo = owo.replace(/(?:r|l)/g, "w").replace(/(?:R|L)/g, "W");

      // Replaces text
      return owo
        .replace(/n([aeiou])/g, "ny")
        .replace(/N([aeiou])/g, "Ny")
        .replace(/N([AEIOU])/g, "NY")
        .replace(/ove/g, "uv")
        .replace(/!+/g, `! ${faces[Math.floor(Math.random() * faces.length)]} `);
    };

    msg.createEmbed(`${FACES[Math.floor(Math.random() * FACES.length)]}`, owoify(args.join(" ").slice(0, 1024)));
  }
}
