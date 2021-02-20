import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

// Cows to use
const cows = {
  default:
    "        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||\n",
  tux: "   \\\n    \\\n        .--.\n       |o_o |\n       |:_/ |\n      //   \\ \\\n     (|     | )\n    /'\\_   _/`\\\n    \\___)=(___/",
  bunny: "  \\\n   \\   \\\n        \\ /\\\n        ( )\n      .( o ).",
  moose:
    "  \\\n   \\   \\_\\_    _/_/\n    \\      \\__/\n           (oo)\\_______\n           (__)\\       )\\/\\\n               ||----w |\n               ||     ||\n",
  sheep:
    "  \\\n   \\\n       __     \n      UooU\\.'@@@@@@`.\n      \\__/(@@@@@@@@@@)\n           (@@@@@@@@)\n           `YY~~~~YY'\n            ||    ||",
  kitty:
    "     \\\n      \\\n       (\"`-'  '-/\") .___..--' ' \"`-._\n         ` *_ *  )    `-.   (      ) .`-.__. `)\n         (_Y_.) ' ._   )   `._` ;  `` -. .-'\n      _.. `--'_..-_/   /--' _ .' ,4\n   ( i l ),-''  ( l i),'  ( ( ! .-'",
  koala: "  \\\n   \\\n       ___  \n     {~._.~}\n      ( Y )\n     ()~*~()   \n     (_)-(_)",
  satanic: "     \\\n      \\  (__)  \n         (\\/)  \n  /-------\\/    \n / | 666 ||    \n*  ||----||      \n   ~~    ~~",
  kiss:
    "     \\\n      \\\n             ,;;;;;;;,\n            ;;;;;;;;;;;,\n           ;;;;;'_____;'\n           ;;;(/))))|((\\\n           _;;((((((|))))\n          / |_\\\\\\\\\\\\\\\\\\\\\\\\\n     .--~(  \\ ~))))))))))))\n    /     \\  `\\-(((((((((((\\\\\n    |    | `\\   ) |\\       /|)\n     |    |  `. _/  \\_____/ |\n      |    , `\\~            /\n       |    \\  \\           /\n      | `.   `\\|          /\n      |   ~-   `\\        /\n       \\____~._/~ -_,   (\\\n        |-----|\\   \\    ';;\n       |      | :;;;'     \\\n      |  /    |            |\n      |       |            |\n",
  skeleton:
    "          \\      (__)      \n           \\     /oo|  \n            \\   (_\"_)*+++++++++*\n                   //I#\\\\\\\\\\\\\\\\I\\\n                   I[I|I|||||I I `\n                   I`I'///'' I I\n                   I I       I I\n                   ~ ~       ~ ~\n                     Scowleton\n",
};

export class CowsayCommand extends Command {
  description = "Makes a cow say something.";
  args = "[text:string] [cow=type:string]";
  allowdms = true;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[], args: string[]) {
    // Lists animals that you can use
    if (!args.length || ["list", msg.string("global.LIST")].includes(args?.[0]?.toLowerCase())) {
      return msg.createEmbed(
        `🐮 ${msg.string("fun.COWSAY")}`,
        msg.string("fun.COWSAY_USAGE", {
          types: Object.keys(cows)
            .map((c) => `\`${c}\``)
            .join(", "),
        }),
      );
    }

    // Finds the cow top use; defaults to the default one
    let cow = Object.keys(cows).find((c) => args.indexOf(`cow=${c}`) !== -1);
    if (!cow) cow = cows.default;
    else {
      args.splice(args.indexOf(`cow=${cow}`), 1);
      if (cows[cow]) cow = cows[cow];
      else cow = cows.default;
    }

    // Fixes line breaks
    let dashes = "";
    let callback;

    // Fixes line breaks and returns them as callback
    const fixLineBreak = (c: string[], l: number) => {
      if (typeof c[1] === "undefined") {
        callback = (e: string) => {
          const su = `< ${e} >`;
          return su;
        };
      } else {
        callback = (e: string, index: number, array: string[]) => {
          let chars2use = ["| ", " |"];
          // Corners
          if (!index) chars2use = ["/ ", " \\"];
          if (index === array.length - 1) chars2use = ["\\ ", " /"];
          let su = `${chars2use[0]}${e}${chars2use[1]}`;
          // Auto spacing
          if (l < 41) su = `${chars2use[0]}${e}${" ".repeat(l - e.length)}${chars2use[1]}`;
          return su;
        };
      }

      // Maps the callback
      return c.map(callback);
    };

    // Sets the cowsay & dashes
    const cowsay = (t: string) => {
      dashes = "";
      let length = Math.max(
        ...t.match(/.{1,41}/g).map((a) => {
          return a.length;
        }),
      );

      // Sets the cow text
      if (length > 41) length = 41;
      dashes = "-".repeat(length + 2);
      dashes = ` ${dashes}`;

      // Replaces dashes and fixes line breaks
      return `\n${dashes.replace(/-/g, "_")}\n${fixLineBreak(t.match(/.{1,41}/g), length).join("\n")}\n${dashes}\n${cow}`;
    };

    // Sends the cowsay
    msg.createEmbed(`🐮 ${msg.string("fun.COWSAY")}`, `\`\`\`\n ${cowsay(args.join(" "))}\n\`\`\``);
  }
}
