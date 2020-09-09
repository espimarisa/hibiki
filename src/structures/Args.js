/**
 * @fileoverview Args
 * @description Loads and parses args and their types
 */

const { readdir } = require("fs");
const path = require("path");
const argtypes_directory = path.join(__dirname, "../utils/argtypes");

class Args {
  /**
   * Creates an arg parser
   * @param {object} bot Main bot object
   */

  constructor(bot) {
    this.bot = bot;
    this.argtypes = {
      string: a => { return a; },
    };

    // Loads argtypes
    readdir(argtypes_directory, (_err, files) => {
      files.forEach(arg => {
        let argtype;
        try {
          argtype = require(`${argtypes_directory}/${arg}`);
        } catch (err) {
          bot.log.error(`Error loading argument ${arg}: ${err}`);
        }

        if (!argtype) return;
        argtype.forEach(atype => this.argtypes[atype.name] = atype);
      });
    });
  }

  /**
   * Parses any args given
   * @param {string} argString The string to look for args
   * @param {string} args The args to parse
   * @param {string} delimiter The text between arg label and type
   * @param {object} msg The message object
   */

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

    // Splits args from the delimiter
    args.split(delimiter).forEach((arg, i) => {
      const argg = argObj[i];
      if (!argg || (!arg && argg.flag !== "fallback")) return;
      if (argg.flag && argg.flag.startsWith("ignore=") && arg === argg.flag.split("ignore=")[1]) return argObj.splice(i, 1);
      if (!this.argtypes[argg.type]) return;
      const value = this.argtypes[argg.type](arg.toLowerCase(), msg, argg.flag, this.bot);
      if (typeof value == "undefined") return;
      argg.value = value;
      argObj[i] = argg;
      argObj.map(val => `${val.optional ? "[" : "<"}${val.name}${val.optional ? "]" : ">"}`).join(delimiter);
    });

    return argObj;
  }
}

module.exports = Args;
