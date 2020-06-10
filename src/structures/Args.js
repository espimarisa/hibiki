/**
 * @fileoverview Arg class & handler
 * @description Loads argtypes & handles them
 */

const { readdir } = require("fs");
const path = require("path");
const argtypes_directory = path.join(__dirname, "../utils/argtypes");

class Args {
  constructor(bot) {
    this.bot = bot;
    this.argtypes = {
      string: (a) => { return a; },
    };

    // Loads args
    readdir(argtypes_directory, (_err, files) => {
      files.forEach(arg => {
        let argtype;
        try {
          argtype = require(`${argtypes_directory}/${arg}`);
        } catch (err) {
          bot.log.error(`Error loading argument ${arg}: ${err}`);
        }

        if (!argtype) return;
        argtype.forEach((atype) => this.argtypes[atype.name] = atype);
      });
    });
  }

  // Parses args
  parse(argString, args, delimiter, msg) {
    const argObj = [];
    argString.split(delimiter).forEach(arg => {
      const r = /(<|\[)(\w{1,}):(\w{1,})&?([\w=*]{1,})?(>|\])/.exec(arg);
      if (!r) return;
      argObj.push({
        name: r[2],
        type: r[3],
        flag: r[4],
        optional: r[1] === "[",
      });
    });

    // Splits args
    args.split(delimiter).forEach((arg, i) => {
      const argg = argObj[i];
      if (!argg || (!arg && argg.flag !== "fallback")) return;
      if (argg.flag && argg.flag.startsWith("ignore=") && arg === argg.flag.split("ignore=")[1]) return argObj.splice(i, 1);
      if (!this.argtypes[argg.type]) return;
      const value = this.argtypes[argg.type](arg.toLowerCase(), msg, argg.flag, this.bot);
      if (typeof value == "undefined") return;
      argg.value = value;
      argObj[i] = argg;
    });

    return argObj;
  }
}

module.exports = Args;
