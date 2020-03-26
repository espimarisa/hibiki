/*
  Verniy Arg Parser
  © 2020 smolespi & resolved
  github.com/smolespi/Verniy
*/

class argParser {
  constructor(bot) {
    this.bot = bot;
    // Types of args
    this.argTypes = {
      bool: (a) => a == "on" || a == "true" || a == "enable" || a == "yes" || a == "y",
      command: (a) => this.bot.commands.find(c => c.id.startsWith(a) || (c.aliases && c.aliases.includes(a))),
      event: (a) => this.bot.events.find(e =>e.id.toLowerCase().startsWith(a)),
      guild: (a) => this.bot.guilds.find(g => g.id == a || g.name == a),
      module: (a) => this.bot.commands.find(c => c.id.toLowerCase().startsWith(a) || (c.aliases && c.aliases.includes(a))) || this.bot.events.find(e => e.id.toLowerCase().startsWith(a)),
      role: (a, guild) => guild.roles.find(r => r.id == a || a == `<@&${r.id}>` || r.name.startsWith(a)),
      string: (a) => { return a },
      user: (a, guild) => guild.members.find(u => u.id == a || a == `<@${u.id}>` || u.username.startsWith(a)),
    };
  }

  // Parses
  parse(argString, args, delimiter, guild) {
    let argObj = [];
    // Sets each arg
    argString.split(delimiter).forEach(arg => {
      let r = /(<|\[)(\w{1,}):(\w{1,})(>|\])/.exec(arg);
      if (!r) return;
      // Pushes the args object
      argObj.push({
        name: r[2],
        type: r[3],
        optional: r[1] == "[",
      });
    });

    args.split(delimiter).forEach((arg, i) => {
      let argg = argObj[i];
      if (!argg) return;
      if (!this.argTypes[argg.type]) return;
      let value = this.argTypes[argg.type](arg.toLowerCase(), guild);
      if (!value) return;
      argg.value = value;
      argObj[i] = argg;
    });
    // Returns the parsed argObject
    return argObj;
  }
}

module.exports = argParser;
