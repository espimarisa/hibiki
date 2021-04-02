import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { urlRegex } from "../../utils/constants";

export class addcommandCommand extends Command {
  description = "Creates a custom command.";
  requiredperms = ["manageMessages"];
  args = "[name:string] [content:string]";
  aliases = ["addcmd", "createcommand"];
  cooldown = 3000;
  staff = true;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[], args: string[]) {
    let guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);

    // If no name was provided
    if (!args.length || (!args.length && !guildconfig)) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.ADDCOMMAND_NONAME"), "error");
    }

    // Gets command name & content
    const name = args[0];
    let content = args.slice(1).join(" ");

    // If no content, if the name is too short, or if the content is too long
    if (!content?.length) return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.ADDCOMMAND_NOCONTENT"), "error");
    if (name.length > 20) return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.ADDCOMMAND_NAMETOOLONG"), "error");
    if (content.length > 1000) return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.ADDCOMMAND_TOOLONG"), "error");

    // If a command already exists
    if (this.bot.commands.find((cmd) => cmd.name === name || cmd.aliases.includes(name))) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.ADDCOMMAND_ALREADYCMD"), "error");
    }

    let imgurl: string;
    const urlcheck = urlRegex.exec(content);
    if (urlcheck) content = content.slice(0, urlcheck.index).concat(content.slice(urlcheck.index + urlcheck[0].length, content.length));
    if (urlcheck) imgurl = urlcheck[0];
    if (!imgurl && msg.attachments && msg.attachments[0]) imgurl = msg.attachments[0].proxy_url;
    if (!imgurl) imgurl = null;

    if (!guildconfig) {
      await this.bot.db.insertBlankGuildConfig(msg.channel.guild.id);

      guildconfig = {
        id: msg.channel.guild.id,
        customCommands: [],
      };
    }
    // If too many commands or if the custom command exists
    if (!guildconfig.customCommands) guildconfig.customCommands = [];
    if (guildconfig.customCommands.length >= 30) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.ADDCOMMAND_TOOMANY"), "error");
    }

    if (guildconfig.customCommands.find((cmd) => cmd.name === name)) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.ADDCOMMAND_ALREADYEXISTS"), "error");
    }

    // Updates database
    guildconfig.customCommands.push({
      name: name,
      content: content,
      createdBy: msg.author.id,
      image: imgurl || null,
    });

    await this.bot.db.updateGuildConfig(msg.channel.guild.id, guildconfig);
    this.bot.emit("commandCreate", msg.channel.guild, msg.author, name);
    msg.createEmbed(msg.string("global.SUCCESS"), msg.string("moderation.ADDCOMMAND_ADDED", { command: name }), "success");
  }
}
