import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class RemovecommandCommand extends Command {
  description = "Removes a custom command.";
  requiredperms = ["manageMessages"];
  args = "[command:string]";
  aliases = ["deletecmd", "deletecommand", "removecmd", "rmcmd", "rmcommand"];
  cooldown = 3000;
  staff = true;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[], args: string[]) {
    const guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);

    // List of custom commands
    if (!args.length) {
      if (!guildconfig?.customCommands?.length) {
        return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.REMOVECOMMAND_NOCOMMNADS"), "error");
      }

      return msg.createEmbed(
        `✨ ${msg.string("moderation.CUSTOM_COMMANDS")}`,
        `${guildconfig.customCommands.map((cmd) => `\`${cmd.name}\``).join(", ")}`,
      );
    }

    // Find the custom command
    const name = args[0];
    const command = guildconfig.customCommands.find((cmd) => cmd.name === name);
    if (!command) return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.REMOVECOMMAND_DOESNTEXIST"), "error");

    // Deletes the command
    guildconfig.customCommands.splice(guildconfig.customCommands.indexOf(command), 1);
    await this.bot.db.updateGuildConfig(msg.channel.guild.id, guildconfig);
    this.bot.emit("commandRemove", msg.channel.guild, msg.author, name);
    msg.createEmbed(msg.string("global.SUCCESS"), msg.string("moderation.REMOVECOMMAND_REMOVED", { command: name }), "success");
  }
}
