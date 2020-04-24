/*
  This parses argument types & configs
  how each type of arg works in commands.
*/

class argParser {
  constructor(bot) {
    this.bot = bot;
    // Types of args
    this.argTypes = {
      string: (a) => { return a; },
    };
    require("fs").readdir(`${__dirname}/ArgTypes`, (err, files) => {
      files.forEach(a => {
        let argtype;
        try {
          argtype = require(`${__dirname}/ArgTypes/${a}`);
        } catch (err) {}
        if (!argtype) return;
        argtype.forEach((adsafasdf, i) => this.argTypes[adsafasdf.name] = adsafasdf);
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
      const value = this.argTypes[argg.type](arg.toLowerCase(), msg, argg.flag);
      if (typeof value == "undefined") return;
      argg.value = value;
      argObj[i] = argg;
    });
    return argObj;
  }
}

module.exports = argParser;
