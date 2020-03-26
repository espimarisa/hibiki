/*
  Verniy Command Handler
  © 2020 smolespi & resolved
  github.com/smolespi/Verniy
*/

const Event = require("../lib/structures/Event");

class Handler extends Event {
  constructor(...args) {
    super(...args, {
      name: "messageCreate",
    });
    this.cooldowns = [];
  }

  async run(msg) {
    // Grabs the guild ID
    let guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);
    let prefix;
    // Sets the prefix
    if (msg.content.startsWith(this.bot.cfg.prefix)) prefix = this.bot.cfg.prefix;
    else if (msg.content.startsWith(`<@${this.bot.user.id}>`)) prefix = `<@${this.bot.user.id}>`;
    else if (msg.content.startsWith(`<@!${this.bot.user.id}>`)) prefix = `<@!${this.bot.user.id}>`;
    else if (guildcfg && guildcfg.prefix && msg.content.startsWith(guildcfg.prefix)) prefix = guildcfg.prefix;
    if (!prefix) return;
    // Looks for the command ran
    const [cmdName, ...args] = msg.content.slice(prefix.length).split(" ").map(s => s.trim());
    let cmd = this.bot.commands.find(c => c.id == cmdName.toLowerCase() || (c.aliases && c.aliases.includes(cmdName)));
    // Prevents bot looping & invalid commands
    if (msg.author.id == this.bot.user.id) return;
    if (msg.author.bot) return;
    if (!cmd) return;

    // Cooldown handler
    if (cmd.cooldown && !this.bot.cfg.owners.includes(msg.author.id)) {
      // Adds cooldown reaction
      if (this.cooldowns.includes(`${cmd.id}:${msg.author.id}`)) return msg.addReaction("🕑")
      else {
        this.cooldowns.push(`${cmd.id}:${msg.author.id}`);
        setTimeout(() => {
          this.cooldowns.splice(this.cooldowns.indexOf(`${cmd.id}:${msg.author.id}`), 1);
        }, cmd.cooldown >= 1000 ? cmd.cooldown : cmd.cooldown * 1000);
      }
    }

    let parsedArgs;
    if (cmd.args) {
      // Sets the parsedArgs
      parsedArgs = this.bot.argParser.parse(cmd.args, args.join(" "), cmd.argsDelimiter, msg.channel.guild);
      // Filters for missingArgs & sends if it's missing any
      let missingargs = parsedArgs.filter(a => !a.value && !a.optional);
      if (missingargs.length) return msg.channel.createMessage(this.bot.embed("❌ Error", `You didn't provide a **${missingargs.map(a => a.name).join(",")}**.`, "error"));
    }

    try {
      cmd.run(msg, args, parsedArgs);
    } catch (e) {
      // Logs if an error happened
      msg.channel.createMessage(`${e}`);
    }
  }
}

module.exports = Handler;
