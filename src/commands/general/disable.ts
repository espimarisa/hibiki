import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class DisableCommand extends Command {
  description = "Disables a command or category.";
  args = "<item:string>";
  requiredperms = ["manageMessages"];
  allowdisable = false;
  staff = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    // Finds the command
    const command = args.join(" ").toLowerCase();
    let guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);

    // Shows a list of disabled items
    // if (!args.length) return msg.channel.createMessage("disabled items: ");

    // Finds valid commands to disable
    const cmds = this.bot.commands.filter((cmd) => cmd.allowdisable === true);
    const categories: string[] = [];

    // Looks for the command
    this.bot.commands.forEach((c) => (categories.includes(c.category) && c.category !== "owner" ? "" : categories.push(c.category)));

    if (!guildconfig) {
      await this.bot.db.insertBlankGuildConfig(msg.channel.guild.id);
      guildconfig = { id: msg.channel.guild.id };
    }

    // Gets the command/category to disable
    const cmd = cmds.find((c) => c.name === command || c.aliases.includes(command));
    const category = categories.find((c) => c.toLowerCase() === command.toLowerCase());

    // Disables a category
    if (!cmd && category) {
      if (!guildconfig.disabledCategories) guildconfig.disabledCategories = [];

      // Prevents owner or general commands from being disabled
      if (category === "owner" || category === "general") {
        return msg.createEmbed(msg.string("global.ERROR"), msg.string("general.DISABLE_CATEGORY_NOTALLOWED"), "error");
      }

      // If a category is already disabled
      if (guildconfig.disabledCategories && guildconfig.disabledCategories.includes(category)) {
        return msg.createEmbed(msg.string("global.ERROR"), msg.string("general.DISABLE_ALREADYDISABLED"), "error");
      }

      // Updates the guildconfig
      guildconfig.disabledCategories.push(category);
      this.bot.db.updateGuildConfig(msg.channel.guild.id, guildconfig);
      this.bot.emit("categoryDisable", msg.channel.guild, msg.member, category);
      return msg.createEmbed(
        msg.string("global.SUCCESS"),
        msg.string("general.DISABLE_CATEGORY_DISABLED", { category: category }),
        "success",
      );
    }

    // Sends if a valid command isn't found
    if (!cmd) return msg.createEmbed(msg.string("global.ERROR"), msg.string("general.DISABLE_COMMAND_NOTFOUND"), "error");
    if (!guildconfig.disabledCmds) guildconfig.disabledCmds = [];

    // Sends if the command is already disabled
    if (guildconfig.disabledCmds && guildconfig.disabledCmds.includes(cmd.name)) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("general.DISABLE_ALREADYDISABLED"), "error");
    }

    if (cmd) {
      // Updates db
      guildconfig.disabledCmds.push(cmd.name);
      await this.bot.db.updateGuildConfig(msg.channel.guild.id, guildconfig);
      this.bot.emit("commandDisable", msg.channel.guild, msg.member, command);
      msg.createEmbed(msg.string("global.SUCCESS"), msg.string("general.DISABLE_COMMAND_DISABLED", { command: cmd.name }), "success");
    }
  }
}
