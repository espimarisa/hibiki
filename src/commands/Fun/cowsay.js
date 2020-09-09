const Command = require("../../structures/Command");

const cows = {
  default: "        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||\n",
  tux: "   \\\n    \\\n        .--.\n       |o_o |\n       |:_/ |\n      //   \\ \\\n     (|     | )\n    /'\\_   _/`\\\n    \\___)=(___/",
  bunny: "  \\\n   \\   \\\n        \\ /\\\n        ( )\n      .( o ).",
  moose: "  \\\n   \\   \\_\\_    _/_/\n    \\      \\__/\n           (oo)\\_______\n           (__)\\       )\\/\\\n               ||----w |\n               ||     ||\n",
  sheep: "  \\\n   \\\n       __     \n      UooU\\.'@@@@@@`.\n      \\__/(@@@@@@@@@@)\n           (@@@@@@@@)\n           `YY~~~~YY'\n            ||    ||",
  kitty: "     \\\n      \\\n       (\"`-'  '-/\") .___..--' ' \"`-._\n         ` *_ *  )    `-.   (      ) .`-.__. `)\n         (_Y_.) ' ._   )   `._` ;  `` -. .-'\n      _.. `--'_..-_/   /--' _ .' ,4\n   ( i l ),-''  ( l i),'  ( ( ! .-'",
  koala: "  \\\n   \\\n       ___  \n     {~._.~}\n      ( Y )\n     ()~*~()   \n     (_)-(_)",
  satanic: "     \\\n      \\  (__)  \n         (\\/)  \n  /-------\\/    \n / | 666 ||    \n*  ||----||      \n   ~~    ~~",
  kiss: "     \\\n      \\\n             ,;;;;;;;,\n            ;;;;;;;;;;;,\n           ;;;;;'_____;'\n           ;;;(/))))|((\\\n           _;;((((((|))))\n          / |_\\\\\\\\\\\\\\\\\\\\\\\\\n     .--~(  \\ ~))))))))))))\n    /     \\  `\\-(((((((((((\\\\\n    |    | `\\   ) |\\       /|)\n     |    |  `. _/  \\_____/ |\n      |    , `\\~            /\n       |    \\  \\           /\n      | `.   `\\|          /\n      |   ~-   `\\        /\n       \\____~._/~ -_,   (\\\n        |-----|\\   \\    ';;\n       |      | :;;;'     \\\n      |  /    |            |\n      |       |            |\n",
  skeleton: "          \\      (__)      \n           \\     /oo|  \n            \\   (_\"_)*+++++++++*\n                   //I#\\\\\\\\\\\\\\\\I\\\n                   I[I|I|||||I I `\n                   I`I'///'' I I\n                   I I       I I\n                   ~ ~       ~ ~\n                     Scowleton\n",
};

class cowsayCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["cow"],
      args: "[text:string] [type:string]",
      description: "Makes a cow say something.",
      allowdms: true,
    });
  }

  async run(msg, args) {
    // Sets the cow
    if (!args.length || args.join(" ") === "list") {
      return this.bot.embed(
        "🐮 Cowsay",
        `Usage: cowsay <text> cow=type \n Types: ${Object.keys(cows).map(c => `\`${c}\``).join(", ")}`,
        msg,
      );
    }

    let cow = Object.keys(cows).find(c => args.indexOf(`cow=${c}`) !== -1);
    if (!cow) cow = cows.default;
    else {
      args.splice(args.indexOf(`cow=${cow}`), 1);
      if (cows[cow]) cow = cows[cow];
      else cow = cows.default;
    }

    // Fixes line breaks
    let dashes = "";
    let callback;
    const fixLineBreak = (c, l) => {
      if (typeof c[1] === "undefined") {
        callback = e => {
          const su = `< ${e} >`;
          return su;
        };
      } else {
        callback = (e, index, array) => {
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
      return c.map(callback);
    };

    // Sets the cowsay
    const cowsay = t => {
      dashes = "";
      let length = Math.max(...t.match(/.{1,41}/g).map(a => {
        return a.length;
      }));

      // Sets the cow text
      if (length > 41) length = 41;
      dashes = "-".repeat(length + 2);
      dashes = ` ${dashes}`;
      return `\n${dashes.replace(/-/g, "_")}\n${fixLineBreak(t.match(/.{1,41}/g), length).join("\n")}\n${dashes}\n${cow}`;
    };

    // Sends the cowsay
    this.bot.embed("🐮 Cowsay", `\`\`\`\n ${cowsay(args.join(" "))}\n\`\`\``, msg);
  }
}


module.exports = cowsayCommand;
