/*
  This handles all commands & paramater functions.
  It also enables Echo to capture command errors.
*/

const Event = require("../lib/structures/Event");
const format = require("../lib/scripts/Format");
const Eris = require("eris");

class Handler extends Event {
  constructor(...args) {
    super(...args, {
      name: "messageCreate",
    });
    this.cooldowns = [];
  }

  async run(msg) {
    // DM handler
    if (msg.channel instanceof Eris.PrivateChannel) {
      if (msg.author.id === this.bot.user.id) return;
      let cmd = this.bot.commands.find(c => msg.content.toLowerCase().startsWith(`${this.bot.cfg.prefix}${c.id}`) || msg.content.toLowerCase().startsWith(c.id));
      if (cmd && cmd.allowdms) cmd.run(msg, msg.content.substring(this.bot.cfg.prefix.length + cmd.id.length + 1).split(" "));
      else if (cmd && !cmd.allowdms) msg.channel.createMessage(this.bot.embed("❌ Error", "This command can't be used in DMs.", "error"));
      // Sends the embed
      return this.bot.createMessage(this.bot.cfg.logchannel, {
        embed: {
          description: `${msg.content}`,
          color: this.bot.embed.colour("general"),
          author: {
            icon_url: msg.author.dynamicAvatarURL(),
            name: `Sent a DM by ${format.tag(msg.author, false)}`,
          },
          image: {
            url: msg.attachments.length !== 0 ? msg.attachments[0].url : "",
          },
        },
      })
    }

    // Blocks bots & blacklisted users
    if (msg.author.bot) return;
    const [blacklist] = await this.bot.db.table("blacklist").filter({ user: msg.author.id });
    if (blacklist) return;
    // Gets the server's ID
    let guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);
    let prefix;
    // Sets the prefix
    // todo - figure out why a custom prefix still lets the cfg.prefix work
    if (guildcfg && guildcfg.prefix && msg.content.startsWith(guildcfg.prefix)) prefix = guildcfg.prefix;
    else if (msg.content.startsWith(this.bot.cfg.prefix)) prefix = this.bot.cfg.prefix;
    else if (msg.content.startsWith(`<@${this.bot.user.id}> `)) prefix = `<@${this.bot.user.id}> `;
    else if (msg.content.startsWith(`<@!${this.bot.user.id}> `)) prefix = `<@!${this.bot.user.id}> `;
    if (!prefix) return;
    // Looks for the command ran
    const [cmdName, ...args] = msg.content.slice(prefix.length).split(" ").map(s => s.trim());
    let cmd = this.bot.commands.find(c => c.id === cmdName.toLowerCase() || c.aliases.includes(cmdName.toLowerCase()));
    if (!cmd) return;

    // Owner cmds
    if (cmd.owner === true && !this.bot.cfg.owners.includes(msg.author.id)) return;

    // Disabled categories
    if (guildcfg && (guildcfg.disabledCategories || []).includes(cmd.category) && cmd.allowdisable) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "The category that command is in is disabled in this server.", "error"));
    }

    // Disabled cmds
    if (guildcfg && (guildcfg.disabledCmds || []).includes(cmd.id) && cmd.allowdisable) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "That command is disabled in this server.", "error"));
    }

    // Client perms
    if ((cmd.clientperms) && !cmd.clientperms.map(c => msg.channel.guild.members.get(this.bot.user.id).permission.has(c)).includes(false)) {
      return msg.channel.createMessage("❌ Error", "I don't have permission to run this command. Be sure my role has the proper permissions.", "error");
    }

    // NSFW-only cmds
    if (cmd.nsfw === true && (msg.channel.nsfw === false || msg.channel.nsfw === undefined)) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "That command can only be ran in NSFW channels.", "error"))
    }

    // Required perms
    if (cmd.requiredperms !== undefined && (!msg.member.permission.has(cmd.requiredperms) || !msg.member.permission.has("administrator")) && (!guildcfg || !guildcfg.staffrole)) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "You don't have permission to run this command.", "error"));
    }

    // Staff cmds
    if (cmd.staff && (!msg.member.permission.has("administrator") || guildcfg !== undefined && guildcfg.staffrole !== undefined && !msg.member.roles.includes(guildcfg.staffrole))) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "That command is only for staff members.", "error"));
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
      // Missing arguments; sends missing
      parsedArgs = this.bot.argParser.parse(cmd.args, args.join(" "), cmd.argsDelimiter, msg);
      let missingargs = parsedArgs.filter(a => !a.value && !a.optional);
      if (missingargs.length) {
        return msg.channel.createMessage(this.bot.embed("❌ Error", `You're missing the **${missingargs.map(a => a.name).join(",")}** argument${missingargs.length > 1 ? "s" : ""}.`, "error"));
      }
    }

    try {
      // Logs when cmds ran
      if (args.length) this.bot.log(`${format.tag(msg.author)} ran ${cmd.id} in ${msg.channel.guild.name}: ${args}`)
      else { this.bot.log(`${format.tag(msg.author)} ran ${cmd.id} in ${msg.channel.guild.name}`) }
      // Tries to run the command
      await cmd.run(msg, args, parsedArgs);
    } catch (e) {
      // // Captures errors with Echo
      // const echo = require("../../Echo/sdk/index");
      // echo.setSettings(require("../cfg").echo);
      // echo.capture(e);
      console.log(e);
      msg.channel.createMessage(this.bot.embed("❌ Error", `An error occurred, and it has been logged. \n \`\`\`js\n${e}\n\`\`\``, "error"));
    }
  }
}

module.exports = Handler;
