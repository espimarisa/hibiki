/**
 * @fileoverview Handler
 * @description Handles commands and their paramaters
 * @todo Stop using eris-additions and make our own global perm handler
 */

const Event = require("structures/Event");
const eris = require("eris-additions")(require("eris"));
const sentry = require("@sentry/node");

/**
 * Listens for messages to check for commands
 * @param {Event} Handler
 * @listens messageCreate
 */

class Handler extends Event {
  constructor(...args) {
    super(...args, {
      name: "messageCreate",
    });
    this.cooldowns = [];
  }

  /**
   * Runs a command
   * @param {object} msg The message object
   * @param {string} [args] Raw args to use
   * @param {string} [pargs] Parsed args to use
   */

  async run(msg) {
    if (!msg || !msg.author || msg.author.bot) return;
    const blacklist = await this.bot.db.table("blacklist").run();
    if (blacklist.find(u => u.user === msg.author.id)) return;

    // DM handling & logger
    if (msg.channel instanceof eris.PrivateChannel && this.bot.config.logchannel) {
      const cmd = this.bot.commands.find(
        c => msg.content.toLowerCase().startsWith(`${this.bot.config.prefixes[0]}${c.id}`) || msg.content.toLowerCase().startsWith(c.id),
      );

      // Commands in dms
      if (cmd && cmd.allowdms) cmd.run(msg, msg.content.substring(this.bot.config.prefixes[0].length + cmd.id.length + 1).split(" "));
      else if (cmd && !cmd.allowdms) this.bot.embed("❌ Error", "That command can only be used in a server.", msg, "error");

      return this.bot.createMessage(this.bot.config.logchannel, {
        embed: {
          description: `${msg.content}`,
          color: this.bot.embed.color("general"),
          author: {
            icon_url: msg.author.dynamicAvatarURL(),
            name: `Messaged by ${this.bot.tag(msg.author)}`,
          },
          image: {
            url: msg.attachments.length !== 0 ? msg.attachments[0].url : "",
          },
        },
      }).catch(() => {});
    }

    let prefix;
    const prefixes = this.bot.config.prefixes.map(p => msg.content.startsWith(p)).indexOf(true);
    const guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id).run();
    if (guildcfg && guildcfg.prefix && msg.content.startsWith(guildcfg.prefix)) prefix = guildcfg.prefix;
    else if ((!guildcfg || !guildcfg.prefix) && (this.bot.config.prefixes && prefixes !== -1)) prefix = this.bot.config.prefixes[prefixes];
    else if (msg.content.startsWith(`<@!${this.bot.user.id}> `)) prefix = `<@!${this.bot.user.id}> `;
    else if (msg.content.startsWith(`<@${this.bot.user.id}> `)) prefix = `<@${this.bot.user.id}> `;
    else if (msg.content.startsWith(`<@${this.bot.user.id}>`)) prefix = `<@${this.bot.user.id}>`;
    else if (msg.content.startsWith(`<@!${this.bot.user.id}>`)) prefix = `<@!${this.bot.user.id}>`;
    if (!prefix) return;

    // Looks for the command ran
    const [cmdName, ...args] = msg.content.trim().slice(prefix.length).split(/ +/g);
    const cmd = this.bot.commands.find(c => c.id === cmdName.toLowerCase() || c.aliases.includes(cmdName.toLowerCase()));
    if (!cmd) return;

    // Permission checking
    if (!msg.channel.memberHasPermission(this.bot.user.id, "sendMessages")) {
      return msg.member.createMessage(`I don't have permission to send messages in <#${msg.channel.id}>.`);
    }

    if (!msg.channel.memberHasPermission(this.bot.user.id, "embedLinks")) {
      return msg.channel.createMessage("In order to function properly, I need permission to **embed links**.");
    }

    // Owner commands
    if (cmd.owner && !this.bot.config.owners.includes(msg.author.id)) return;

    // Disabled categories
    if (guildcfg && (guildcfg.disabledCategories || []).includes(cmd.category) && cmd.allowdisable) {
      return this.bot.embed("❌ Error", "The category that command is in is disabled in this server.", msg, "error");
    }

    // Disabled commands
    if (guildcfg && (guildcfg.disabledCmds || []).includes(cmd.id) && cmd.allowdisable) {
      return this.bot.embed("❌ Error", "That command is disabled in this server.", msg, "error");
    }

    // Client perms
    if (cmd.clientperms) {
      const botperms = msg.channel.guild.members.get(this.bot.user.id).permission;
      if (!botperms.has("embedLinks")) {
        return msg.channel.createMessage("In order to function properly, I need permission to **embed links**.");
      }

      if (!botperms.has(cmd.clientperms)) {
        return this.bot.embed("❌ Error", `I need the **${cmd.clientperms}** permission to run that command.`, msg, "error");
      }
    }

    // NSFW commands
    if (cmd.nsfw && !msg.channel.nsfw) {
      return this.bot.embed("❌ Error", "That command can only be ran in a NSFW channel.", msg, "error");
    }

    // Required perms
    if (cmd.requiredperms && (!msg.member.permission.has(cmd.requiredperms) ||
        !msg.member.permission.has("administrator")) && (!guildcfg || !guildcfg.staffRole)) {
      return this.bot.embed("❌ Error", `You need the **${cmd.requiredperms}** permission to run this.`, msg, "error");
    }

    // Staff commands
    if (cmd.staff && (!msg.member.permission.has("administrator") || guildcfg && guildcfg.staffRole &&
        !msg.member.roles.includes(guildcfg.staffRole))) {
      return this.bot.embed("❌ Error", "That command is only for staff members.", msg, "error");
    }

    // Cooldowns
    if (cmd.cooldown && !this.bot.config.owners.includes(msg.author.id)) {
      if (this.cooldowns.includes(`${cmd.id}:${msg.author.id}`)) return msg.addReaction("⌛");
      else {
        this.cooldowns.push(`${cmd.id}:${msg.author.id}`);
        setTimeout(() => {
          this.cooldowns.splice(this.cooldowns.indexOf(`${cmd.id}:${msg.author.id}`), 1);
        }, cmd.cooldown >= 1000 ? cmd.cooldown : cmd.cooldown * 1000);
      }
    }

    // Command args
    let parsedArgs;
    if (cmd.args) {
      parsedArgs = this.bot.args.parse(cmd.args, args.join(" "), cmd.argsDelimiter, msg);
      const missingargs = parsedArgs.filter(a => typeof a.value == "undefined" && !a.optional);
      if (missingargs.length) {
        return this.bot.embed("❌ Error", `No **${missingargs.map(a => a.name).join(" or ")}** was provided.`, msg, "error");
      }
    }

    try {
      // Runs the command
      if (args.length) this.bot.log(`${this.bot.tag(msg.author)} ran ${cmd.id} in ${msg.channel.guild.name}: ${args}`);
      else { this.bot.log(`${this.bot.tag(msg.author)} ran ${cmd.id} in ${msg.channel.guild.name}`); }
      await cmd.run(msg, args, parsedArgs);
    } catch (err) {
      if (err === "timeout") return;
      sentry.configureScope(scope => {
        scope.setUser({ id: msg.author.id, username: this.bot.tag(msg.author) });
        scope.setExtra("guild", msg.channel.guild.name);
      });

      // Logs the error
      sentry.captureException(err);
      console.error(err);
      return this.bot.embed("❌ Error", `An error occurred and has been logged. \n \`\`\`js\n${err}\n\`\`\``, msg, "error");
    }
  }
}

module.exports = Handler;
