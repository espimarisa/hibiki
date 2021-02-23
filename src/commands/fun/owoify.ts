import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
const faces = ["(・`ω´・)", "OwO", "ouo", "UwU", "uwu", ">w<", "^w^"];

export class OWOIfyCommand extends Command {
  description = "OwOify's some text.";
  args = "<text:string>";
  aliases = ["owo"];
  allowdms = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    function owoify(owo: string) {
      // Replaces codeblocks
      if (owo.startsWith("```") && owo.endsWith("```")) {
        owo = owo.replace(/(?<!w)(?<!o)(?<!functi)o(?!o)(?!w)/gi, "owo");
        owo = owo.replace(/(?<!w)(?<!u)u(?!u)(?!m)(?!w)/gi, "uwu");
        owo = owo.replace(/[{}]/g, "♥");
        owo = owo.replace(/array/gi, "awway");
        owo = owo.replace(/boolean/gi, "buwulean");
      } else {
        owo = owo.replace(/(?:r|l)/g, "w");
        owo = owo.replace(/(?:R|L)/g, "W");
      }

      // Replaces text
      owo = owo.replace(/n([aeiou])/g, "ny");
      owo = owo.replace(/N([aeiou])/g, "Ny");
      owo = owo.replace(/N([AEIOU])/g, "NY");
      owo = owo.replace(/ove/g, "uv");
      owo = owo.replace(/!+/g, `! ${faces[Math.floor(Math.random() * faces.length)]} `);
      return owo;
    }

    msg.createEmbed(`${faces[Math.floor(Math.random() * faces.length)]}`, owoify(args.join(" ").slice(0, 1024)));
  }
}
