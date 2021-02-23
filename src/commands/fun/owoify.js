const Command = require("../../structures/Command");
const faces = ["(・`ω´・)", "OwO", "ouo", "UwU", "uwu", ">w<", "^w^"];

class owoifyCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["loliscript", "owo"],
      args: "<text:string>",
      description: "OwOifys some text or code.",
      allowdms: true,
    });
  }

  run(msg, args) {
    function owoify(owo) {
      // Replaces codeblocks
      if (owo.startsWith("```") && owo.endsWith("```")) {
        owo = owo.replace(/(?<!w)(?<!o)(?<!functi)o(?!o)(?!w)/ig, "owo");
        owo = owo.replace(/(?<!w)(?<!u)u(?!u)(?!m)(?!w)/ig, "uwu");
        owo = owo.replace(/[{}]/g, "♥");
        owo = owo.replace(/array/gi, "awway");
        owo = owo.replace(/boolean/gi, "buwulean");
      } else {
        owo = owo.replace(/(?:r|l)/g, "w");
        owo = owo.replace(/(?:R|L)/g, "W");
      }

      owo = owo.replace(/n([aeiou])/g, "ny");
      owo = owo.replace(/N([aeiou])/g, "Ny");
      owo = owo.replace(/N([AEIOU])/g, "NY");
      owo = owo.replace(/ove/g, "uv");
      owo = owo.replace(/!+/g, `! ${faces[Math.floor(Math.random() * faces.length)]} `);
      return owo;
    }

    this.bot.embed(`${faces[Math.floor(Math.random() * faces.length)]}`, owoify(args.join(" ").slice(0, 1024)), msg);
  }
}

module.exports = owoifyCommand;
