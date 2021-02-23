const Command = require("../../structures/Command");

class addcommandCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["addcmd", "createcommand"],
      args: "[name:string] [content:string]",
      description: "Creates a custom command.",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args) {
    let guildconfig = await this.bot.db.table("guildconfig").get(msg.channel.guild.id).run();

    if (!args.length || !args.length && !guildconfig) {
      return this.bot.embed("❌ Error", "No **name** was provided.", msg, "error");
    }

    // Gets command name & content
    const name = args[0];
    const content = args.slice(1).join(" ");

    // If no content, if the name is too short, or if the content is too long
    if (!content || !content.length) return this.bot.embed("❌ Error", "No **content** was provided.", msg, "error");
    if (name.length > 20) return this.bot.embed("❌ Error", "Name must be under **20** characters.", msg, "error");
    if (content.length > 1000) return this.bot.embed("❌ Error", "Content must be under **1000** characters.", msg, "error");

    // If a command already exists
    if (this.bot.commands.find(cmd => cmd.id === name || cmd.aliases.includes(name))) {
      return this.bot.embed("❌ Error", "That command is already a built-in one. Choose a different name.", msg, "error");
    }

    // URL checker
    let imgurl;
    args = args.join(" ");
    const urlcheck = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.exec(args);
    if (urlcheck) args = args.slice(0, urlcheck.index) + args.slice(urlcheck.index + urlcheck[0].length, args.length);
    if (urlcheck) imgurl = urlcheck[0];
    if (!imgurl && msg.attachments && msg.attachments[0]) imgurl = msg.attachments[0].proxy_url;
    if (!imgurl) imgurl = null;

    if (!guildconfig) {
      await this.bot.db.table("guildconfig").insert({
        id: msg.guild.id,
        customCommands: [],
      }).run();

      guildconfig = {
        id: msg.guild.id,
        customCommands: [],
      };
    }

    // If too many commands or if the custom command exists
    if (!guildconfig.customCommands) guildconfig.customCommands = [];
    if (guildconfig.customCommands.length >= 30) return this.bot.embed("❌ Error", "You cant have more than **30** commands.", msg, "error");
    if (guildconfig.customCommands.find(cmd => cmd.name === name)) return this.bot.embed("❌ Error", `The custom command **${name}** already exists.`, msg, "error");

    // Updates database
    guildconfig.customCommands.push({
      name: name,
      content: content,
      createdBy: msg.author.id,
      image: imgurl ? imgurl : null,
    });

    await this.bot.db.table("guildconfig").get(msg.guild.id).update(guildconfig).run();
    this.bot.emit("commandCreate", msg.channel.guild, msg.author, name);
    this.bot.embed("✅ Success", `Successfully created command **${name}** with content: **${content}**`, msg, "success");
  }
}

module.exports = addcommandCommand;
