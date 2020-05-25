const Event = require("../lib/structures/Event");
const format = require("../lib/scripts/Format");
const Eris = require("eris-additions")(require("eris"));
const sentry = require("@sentry/node");

class Handler extends Event {
  constructor(...args) {
    super(...args, {
      name: "messageCreate",
    });
    this.cooldowns = [];
  }

  async run(msg) {
    // Logs DMs
    if (msg.channel instanceof Eris.PrivateChannel) {
      if (msg.author.id === this.bot.user.id) return;
      const cmd = this.bot.commands.find(c => msg.content.toLowerCase().startsWith(`${this.bot.config.prefixes[0]}${c.id}`) || msg.content.toLowerCase().startsWith(c.id));
      if (cmd && cmd.allowdms) cmd.run(msg, msg.content.substring(this.bot.config.prefixes[0].length + cmd.id.length + 1).split(" "));
      else if (cmd && !cmd.allowdms) msg.channel.createMessage(this.bot.embed("❌ Error", "This command can't be used in DMs.", "error"));
      return this.bot.createMessage(this.bot.config.logchannel, {
        embed: {
          description: `${msg.content}`,
          color: this.bot.embed.color("general"),
          author: {
            icon_url: msg.author.dynamicAvatarURL(),
            name: `Sent a DM by ${format.tag(msg.author, false)}`,
          },
          image: {
            url: msg.attachments.length !== 0 ? msg.attachments[0].url : "",
          },
        },
      }).catch(() => {});
    }

    if (msg.author.bot) return;
    const blacklist = await this.bot.db.table("blacklist");
    if (blacklist.find(u => u.user === msg.author.id)) return;
    let prefix;
    // Sets the prefixes
    const prefixes = this.bot.config.prefixes.map(p => msg.content.startsWith(p)).indexOf(true);
    const guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);
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
    // If bot mentioned with no content, show prefixes
    if (!cmdName.length && (prefix.startsWith(`<@${this.bot.user.id}>`) || prefix.startsWith(`<@!${this.bot.user.id}>`))) {
      return msg.channel.createMessage(this.bot.embed("🤖 Prefix", `The prefix in this server is \`${guildcfg && guildcfg.prefix ? guildcfg.prefix : this.bot.config.prefixes[0]}\`.`));
    } else if (!cmd) return;

    if (!msg.channel.memberHasPermission(this.bot.user.id, "sendMessages")) {
      return msg.member.createMessage(`I don't have permission to send messages in <#${msg.channel.id}>.`);
    }

    if (!msg.channel.memberHasPermission(this.bot.user.id, "embedLinks")) {
      return msg.channel.createMessage("In order to function properly, I need permission to **embed links**.");
    }

    if (cmd.owner && !this.bot.config.owners.includes(msg.author.id)) return;

    if (guildcfg && (guildcfg.disabledCategories || []).includes(cmd.category) && cmd.allowdisable) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "The category that command is in is disabled in this server.", "error"));
    }

    if (guildcfg && (guildcfg.disabledCmds || []).includes(cmd.id) && cmd.allowdisable) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "That command is disabled in this server.", "error"));
    }

    if (cmd.clientperms) {
      const botperms = msg.channel.guild.members.get(this.bot.user.id).permission;
      if (!botperms.has("embedLinks")) return msg.channel.createMessage(`❌ Error - I need permission to **embed links** to work properly.`);
      if (!botperms.has(cmd.clientperms)) {
        return msg.channel.createMessage(this.bot.embed("❌ Error", `I need the **${cmd.clientperms}** permission to run this command.`, "error"));
      }
    }

    if (cmd.nsfw && !msg.channel.nsfw) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "That command can only be ran in NSFW channels.", "error"));
    }

    if (cmd.requiredperms && (!msg.member.permission.has(cmd.requiredperms) || !msg.member.permission.has("administrator")) && (!guildcfg || !guildcfg.staffRole)) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `You need the **${cmd.requiredperms}** permission to run this.`, "error"));
    }

    if (cmd.staff && (!msg.member.permission.has("administrator") || guildcfg && guildcfg.staffRole && !msg.member.roles.includes(guildcfg.staffRole))) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "That command is only for staff members.", "error"));
    }

    // Cooldown handler
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
      parsedArgs = this.bot.argParser.parse(cmd.args, args.join(" "), cmd.argsDelimiter, msg);
      const missingargs = parsedArgs.filter(a => typeof a.value == "undefined" && !a.optional);
      if (missingargs.length) {
        return msg.channel.createMessage(this.bot.embed("❌ Error", `No **${missingargs.map(a => a.name).join(" or ")}** was provided.`, "error"));
      }
    }

    try {
      // Tries to run the command
      if (args.length) this.bot.log(`${format.tag(msg.author)} ran ${cmd.id} in ${msg.channel.guild.name}: ${args}`);
      else { this.bot.log(`${format.tag(msg.author)} ran ${cmd.id} in ${msg.channel.guild.name}`); }
      await cmd.run(msg, args, parsedArgs);
    } catch (e) {
      // Sentry info
      if (e === "timeout") return;
      sentry.configureScope(scope => {
        scope.setUser({ id: msg.author.id, username: format.tag(msg.author) });
        scope.setExtra("guild", msg.channel.guild.name);
      });

      sentry.captureException(e);
      console.log(e);
      msg.channel.createMessage(this.bot.embed("❌ Error", `An error occurred, and has been logged. \n \`\`\`js\n${e}\n\`\`\``, "error"));
    }
  }
}

module.exports = Handler;
