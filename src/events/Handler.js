/*
  This handles all commands & some functionality.
  It also enables Echo to capture most errors.
*/

const Eris = require("eris");
const Event = require("../lib/structures/Event");

// Allows msg.guild to work
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
    // Blocks bots & blacklisted users
    if (msg.author.bot) return;
    const [blacklist] = await this.bot.db.table("blacklist").filter({ user: msg.author.id });
    if (blacklist) return;
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
    if (!cmd) return;
    // Disabled commands/categories
    if (guildcfg && (guildcfg.disabledCategories || []).includes(cmd.category) && cmd.allowdisable) return msg.channel.createMessage(this.bot.embed("❌ Error", "The category that command is in is disabled in this server.", "error"));
    if (guildcfg && (guildcfg.disabledCmds || []).includes(cmd.id) && cmd.allowdisable) return msg.channel.createMessage(this.bot.embed("❌ Error", "That command is disabled in this server.", "error"));
    // Handlers for cmd parameters
    if (Array.isArray(cmd.clientperms) && !cmd.clientperms.map(c => msg.guild.members.get(this.bot.user.id).permission.has(c)).includes(false)) return msg.channel.createMessage("❌ Error", "I don't have permission to do this.", "error");
    if (cmd.owner == true && !this.bot.cfg.owners.includes(msg.author.id)) return;
    if (cmd.nsfw == true && (msg.channel.nsfw == false || msg.channel.nsfw == undefined)) return msg.channel.createMessage(this.bot.embed("❌ Error", "That command can only be ran in NSFW channels.", "error"))
    if (cmd.requiredperms != undefined && (!msg.member.permission.has(cmd.requiredperms) || !msg.member.permission.has("administrator")) && (!guildcfg || !guildcfg.staffrole)) return msg.channel.createMessage(this.bot.embed("❌ Error", "You don't have permission to run this command.", "error"));
    if (cmd.staff && (!msg.member.permission.has("administrator") || guildcfg != undefined && guildcfg.staffrole != undefined && !msg.member.roles.includes(guildcfg.staffrole))) return msg.channel.createMessage(this.bot.embed("❌ Error", "This command is only for staff members.", "error"));

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
      parsedArgs = this.bot.argParser.parse(cmd.args, args.join(" "), cmd.argsDelimiter, msg);
      // Filters for missingArgs & sends if it's missing any
      let missingargs = parsedArgs.filter(a => !a.value && !a.optional);
      // todo: clean this output up
      // if (missingargs.length) return msg.channel.createMessage(this.bot.embed("❌ Error", `You didn't provide a **${missingargs.map(a => a.name).join(",")}**.`, "error"));
    }

    try {
      // Tries to run the command
      await cmd.run(msg, args, parsedArgs);
    } catch (e) {
      // Captures errors with Echo
      const echo = require("../../Echo/sdk/index");
      echo.setSettings(require("../cfg").echo);
      echo.capture(e);
      msg.channel.createMessage(this.bot.embed("❌ Error", `An error occured and has been logged. \n \`\`\`js\n${e}\n\`\`\``, "error"));
    }
  }
}

module.exports = Handler;
