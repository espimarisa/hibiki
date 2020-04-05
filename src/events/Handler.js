/*
  This handles all commands & some functionality.
  It also enables Echo to capture most errors.
*/

const Eris = require("eris");
const Event = require("../lib/structures/Event");

// Allows using msg.guild instead of msg.channel.guild
Object.defineProperty(Eris.Message.prototype, "guild", {
  get: function() { return this.channel.guild; },
});

class Handler extends Event {
  constructor(...args) {
    super(...args, {
      name: "messageCreate",
    });
    this.cooldowns = [];
  }

  async run(msg) {
    // Gets the server's ID
    let guildcfg = await this.bot.db.table("guildcfg").get(msg.guild.id);
    let prefix;
    // Sets the prefix
    if (msg.content.startsWith(this.bot.cfg.prefix)) prefix = this.bot.cfg.prefix;
    else if (msg.content.startsWith(`<@${this.bot.user.id}>`)) prefix = `<@${this.bot.user.id}>`;
    else if (msg.content.startsWith(`<@!${this.bot.user.id}>`)) prefix = `<@!${this.bot.user.id}>`;
    else if (guildcfg && guildcfg.prefix && msg.content.startsWith(guildcfg.prefix)) prefix = guildcfg.prefix;
    if (!prefix) return;
    // Looks for the command ran
    const [cmdName, ...args] = msg.content.slice(prefix.length).split(" ").map(s => s.trim());
    let cmd = this.bot.commands.find(c => c.id == cmdName.toLowerCase());
    // Prevents bot looping & invalid commands
    if (msg.author.bot) return;
    if (!cmd) return;

    // Staff commands
    if (cmd.staff && (!msg.member.permission.has("administrator") || guildcfg != undefined && guildcfg.staffrole != undefined && !msg.member.roles.includes(guildcfg.staffrole))) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "This command is only for staff members.", "error"));
    }

    // Required permissions
    if (cmd.requiredperms != undefined && (!msg.member.permission.has(cmd.requiredperms) || !msg.member.permission.has("administrator")) && (!guildcfg || !guildcfg.staffrole)) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "You don't have permission to run this command.", "error"));
    }

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
      parsedArgs = this.bot.argParser.parse(cmd.args, args.join(" "), cmd.argsDelimiter, msg.guild);
      // Filters for missingArgs & sends if it's missing any
      let missingargs = parsedArgs.filter(a => !a.value && !a.optional);
      // todo: clean this output up
      if (missingargs.length) return msg.channel.createMessage(this.bot.embed("❌ Error", `You didn't provide a **${missingargs.map(a => a.name).join(",")}**.`, "error"));
    }

    try {
      await cmd.run(msg, args, parsedArgs);
    } catch (e) {
      const echo = require("../../Echo/sdk/index");
      echo.setSettings(require("../cfg").echo);
      echo.capture(e);
      // Logs if an error happened
      msg.channel.createMessage(`${e}`);
    }
  }
}

module.exports = Handler;
