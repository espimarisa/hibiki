/**
 * @file Enable command
 * @description Enables a disabled command or category
 */

import type { Message, TextChannel } from "eris";

import { Command } from "../../classes/Command";

export class EnableCommand extends Command {
  description = "Enables a disabled command or category.";
  args = "<item:string>";
  requiredperms = ["manageMessages"];
  allowdisable = false;
  staff = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    // Finds the command
    const command = args.join(" ").toLowerCase();
    let guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);

    // Shows a list of disabled items
    // if (!args.length) return msg.channel.createMessage("enabled items: ");

    // Finds valid commands to enable
    const cmds = this.bot.commands.filter((cmd) => cmd.allowdisable === true);
    const categories: string[] = [];

    // Looks for the command
    this.bot.commands.forEach((c) => (categories.includes(c.category) && c.category !== "owner" ? "" : categories.push(c.category)));

    if (!guildconfig) {
      await this.bot.db.insertBlankGuildConfig(msg.channel.guild.id);
      guildconfig = { id: msg.channel.guild.id };
    }

    // Gets the command/category to enable
    const cmd = cmds.find((c) => c.name === command || c.aliases.includes(command));
    const category = categories.find((c) => c.toLowerCase() === command.toLowerCase());

    // Disables a category
    if (!cmd && category) {
      if (!guildconfig.disabledCategories) guildconfig.disabledCategories = [];
      if (!guildconfig.disabledCategories.includes(category)) {
        return msg.createEmbed(msg.string("global.ERROR"), msg.string("general.ENABLE_CATEGORY_ALREADYENABLED"), "error");
      }

      // Updates the guildconfig
      guildconfig.disabledCategories.splice(guildconfig.disabledCategories.indexOf(category), 1);
      await this.bot.db.updateGuildConfig(msg.channel.guild.id, guildconfig);
      this.bot.emit("categoryEnable", msg.channel.guild, msg.member, category);
      return msg.createEmbed(
        msg.string("global.SUCCESS"),
        msg.string("general.ENABLE_CATEGORY_ENABLED", { category: category }),
        "success",
      );
    }

    // Sends if a valid command isn't found or isn't disabled
    if (!cmd) return msg.createEmbed(msg.string("global.ERROR"), msg.string("general.DISABLE_COMMAND_NOTFOUND"), "error");
    if (!guildconfig.disabledCmds) guildconfig.disabledCmds = [];
    if (guildconfig.disabledCmds && !guildconfig.disabledCmds.includes(cmd.name)) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("general.ENABLE_ALREADYENABLED"), "error");
    }

    if (cmd) {
      // Updates the guildconfig
      guildconfig.disabledCmds.splice(guildconfig.disabledCmds.indexOf(cmd.name), 1);
      await this.bot.db.updateGuildConfig(msg.channel.guild.id, guildconfig);
      this.bot.emit("commandEnable", msg.channel.guild, msg.member, command);
      msg.createEmbed(msg.string("global.SUCCESS"), msg.string("general.ENABLE_COMMAND_ENABLED", { command: cmd.name }), "success");
    }
  }
}
