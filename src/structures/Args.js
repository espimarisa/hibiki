/*
  This parses argument types & configs
  how each type of arg works in commands.
*/

class argParser {
  constructor(bot) {
    this.bot = bot;
    // Types of args
    this.argTypes = {
      bool: (a) => a === "on" || a === "true" || a === "enable" || a === "yes" || a === "y",
      channel: (a, msg) => msg.channel.guild.channels.find(c => c.id === a || a.startsWith(`<#${c.id}>`) || c.name.startsWith(a)),
      command: (a) => this.bot.commands.find(c => c.id.startsWith(a) || (c.aliases && c.aliases.includes(a))),
      event: (a) => this.bot.events.find(e => e.id.toLowerCase().startsWith(a)),
      guild: (a) => this.bot.guilds.find(g => g.id === a || g.name === a),
      module: (a) => this.bot.commands.find(c => c.id.toLowerCase().startsWith(a) || (c.aliases && c.aliases.includes(a))),
      role: (a, msg) => msg.channel.guild.roles.find(r => r.id === a || a.startsWith(`<@&${r.id}>`) || r.name.startsWith(a)),
      string: (a) => { return a },
      user: (a, msg, flag) => {
        let user = msg.channel.guild.members.find(m => m.username.startsWith(a) || m.id === a || a.startsWith(`<@!${m.id}>`) || msg.mentions.includes(m.id));
        if (!a || !user && flag === "fallback") return msg.channel.guild.members.get(msg.author.id);
        return user;
      },
    };
  }

  // Parses each type of arg
  parse(argString, args, delimiter, msg) {
    let argObj = [];
    // Sets each arg
    argString.split(delimiter).forEach(arg => {
      // Hibiki, powered by unreliable regexes
      let r = /(<|\[)(\w{1,}):(\w{1,})&?([\w=*]{1,})?(>|\])/.exec(arg);
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
      let argg = argObj[i];
      if (!argg || (!arg && argg.flag !== "fallback")) return;
      // Ignore flag
      if (argg.flag && argg.flag.startsWith("ignore=") && arg === argg.flag.split("ignore=")[1]) return argObj.splice(i, 1);
      if (!this.argTypes[argg.type]) return;
      let value = this.argTypes[argg.type](arg.toLowerCase(), msg, argg.flag);
      if (!value) return;
      argg.value = value;
      argObj[i] = argg;
    });
    return argObj;
  }
}

module.exports = argParser;
