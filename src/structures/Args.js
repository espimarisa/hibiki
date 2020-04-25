/*
  This loads ArgTypes and parses args.
*/

class argParser {
  constructor(bot) {
    this.bot = bot;
    // Types of args
    this.argTypes = {
      string: (a) => { return a; },
    };
    // Looks for argtypes
    require("fs").readdir(`${__dirname}/ArgTypes`, (_err, files) => {
      files.forEach(a => {
        let argtype;
        try {
          // Tries to load each argtype
          argtype = require(`${__dirname}/ArgTypes/${a}`);
        } catch (err) {
          // Logs if an arg couldn't be loaded
          this.bot.log.error(`Error while loading ArgType ${a}: ${err}`);
        }
        if (!argtype) return;
        argtype.forEach((atype) => this.argTypes[atype.name] = atype);
      });
    });
  }

  // Parses each type of arg
  parse(argString, args, delimiter, msg) {
    const argObj = [];
    // Sets each arg
    argString.split(delimiter).forEach(arg => {
      const r = /(<|\[)(\w{1,}):(\w{1,})&?([\w=*]{1,})?(>|\])/.exec(arg);
      if (!r) return;
      argObj.push({
        name: r[2],
        type: r[3],
        flag: r[4],
        // Optional args are in []
        optional: r[1] === "[",
      });
    });

    // Splits each arg
    args.split(delimiter).forEach((arg, i) => {
      const argg = argObj[i];
      if (!argg || (!arg && argg.flag !== "fallback")) return;
      // Ignore flag
      if (argg.flag && argg.flag.startsWith("ignore=") && arg === argg.flag.split("ignore=")[1]) return argObj.splice(i, 1);
      if (!this.argTypes[argg.type]) return;
      const value = this.argTypes[argg.type](arg.toLowerCase(), msg, argg.flag, this.bot);
      if (typeof value == "undefined") return;
      argg.value = value;
      argObj[i] = argg;
    });
    return argObj;
  }
}

module.exports = argParser;
