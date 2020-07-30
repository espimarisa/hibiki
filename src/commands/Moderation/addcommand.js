const Command = require("../../structures/Command");

class addcommandCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["addcmd", "createcommand"],
      args: "[name:string] [content:string]",
      description: "Creates a custom command.",
      requiredPerms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args) {
    let guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id).run();

    if (!args.length || !args.length && !guildcfg) {
      return this.bot.embed("❌ Error", "retard", msg, "error");
    }

    const name = args[0];
    let content = args.slice(1).join(" ");

    if (!content || !content.length) return this.bot.embed("❌ Error", "No **content** was provided.", msg, "error");
    if (name.length > 20) return this.bot.embed("❌ Error", "Name must be under **20** characters.", msg, "error");
    if (content.length > 1000) return this.bot.embed("❌ Error", "Content must be under **1000** characters.", msg, "error");

    if (this.bot.commands.find(cmd => cmd.id === name || cmd.aliases.includes(name))) {
      return this.bot.embed("❌ Error", "That command already exists.", msg, "error");
    }

    // Image parsing
    let img;
    const urlcheck = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.exec(content);
    if (urlcheck && (urlcheck[0].endsWith(".jpg") || urlcheck[0].endsWith(".png") || urlcheck[0].endsWith(".gif"))) content = content.slice(0, urlcheck.index) + content.slice(urlcheck.index + urlcheck[0].length, content.length);
    if (urlcheck && (urlcheck[0].endsWith(".jpg") || urlcheck[0].endsWith(".png") || urlcheck[0].endsWith(".gif"))) img = urlcheck[0];
    if (msg.attachments && msg.attachments[0]) img = msg.attachments[0].proxy_url;

    if (!guildcfg) {
      await this.bot.db.table("guildcfg").insert({
        id: msg.guild.id,
        customCommands: [],
      }).run();

      guildcfg = {
        id: msg.guild.id,
        customCommands: [],
      };
    }

    if (!guildcfg.customCommands) guildcfg.customCommands = [];
    if (guildcfg.customCommands.length >= 30) return this.bot.embed("❌ Error", "You cant have more than **30** commands.", msg, "error");
    if (guildcfg.customCommands.find(cmd => cmd.name === name)) return this.bot.embed("❌ Error", `The command **${name}** already exists.`, msg, "error");

    guildcfg.customCommands.push({
      name: name,
      content: content,
      createdBy: msg.author.id,
      image: img ? img : null,
    });

    await this.bot.db.table("guildcfg").get(msg.guild.id).update(guildcfg).run();
    this.bot.emit("commandCreate", msg.channel.guild, msg.author, name);
    this.bot.embed("✅ Success", `Successfully created command **${name}** with content: **${content}**`, msg, "success");
  }
}

module.exports = addcommandCommand;
