const Command = require("../../structures/Command");

class disableCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<item:string>",
      description: "Disables a command or category.",
      allowdisable: false,
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, [command]) {
    let guildconfig = await this.bot.db.table("guildconfig").get(msg.channel.guild.id).run();
    const cmds = this.bot.commands.filter(cmd => cmd.allowdisable);
    const categories = [];
    this.bot.commands.forEach(c => categories.includes(c.category) && c.category !== "Owner" ? "" : categories.push(c.category));

    if (!guildconfig) {
      await this.bot.db.table("guildconfig").insert({
        id: msg.channel.guild.id,
        disabledCmds: [],
        disabledCategories: [],
      }).run();

      guildconfig = { id: msg.channel.guild.id, disabledCmds: [], disabledCategories: [] };
    }

    // Looks for cmd/category
    const cmd = cmds.find(c => (c.id === command || c.aliases.includes(command)));
    const category = categories.find(c => c.toLowerCase() === command.toLowerCase());

    // If a category was found but not a command
    if (!cmd && category) {
      if (!guildconfig.disabledCategories) guildconfig.disabledCategories = [];

      // Prevents owner or general commands from being disabled
      if (category === "Owner" || category === "General") {
        return this.bot.embed("❌ Error", "That's not allowed to be disabled.", msg, "error");
      }

      // If a category is already disabled
      if (guildconfig.disabledCategories && guildconfig.disabledCategories.includes(category)) {
        return this.bot.embed("❌ Error", "That's already disabled.", msg, "error");
      }

      // Updates db
      guildconfig.disabledCategories.push(category);
      await this.bot.db.table("guildconfig").get(msg.channel.guild.id).update(guildconfig).run();
      this.bot.emit("categoryDisable", msg.channel.guild, msg.member, category);
      return this.bot.embed("✅ Success", `The **${category}** category have been disabled`, msg, "success");
    }

    // If not found or is already disabled
    if (!cmd) return this.bot.embed("❌ Error", "That command/category doesn't exist or isn't allowed to be disabled.", msg, "error");
    if (!guildconfig.disabledCmds) guildconfig.disabledCmds = [];
    if (guildconfig.disabledCmds && guildconfig.disabledCmds.includes(cmd.id)) {
      return this.bot.embed("❌ Error", "That's already disabled.", msg, "error");
    }

    if (cmd) {
      // Updates db
      guildconfig.disabledCmds.push(cmd.id);
      await this.bot.db.table("guildconfig").get(msg.channel.guild.id).update(guildconfig).run();
      this.bot.emit("commandDisable", msg.channel.guild, msg.member, command);
      this.bot.embed("✅ Success", `The **${cmd.id}** command has been disabled.`, msg, "success");
    } else {
      this.bot.embed("❌ Error", "That isn't allowed to be disabled.", msg, "error");
    }
  }
}

module.exports = disableCommand;
