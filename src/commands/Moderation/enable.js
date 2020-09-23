const Command = require("../../structures/Command");

class enableCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<item:string>",
      description: "Enables a command or category.",
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
    const cmd = cmds.find(c => (c.id === command || c.aliases.includes(command)) && c.allowdisable);
    const category = categories.find(c => c.toLowerCase() === command.toLowerCase());

    // If there's no command, but a category
    if (!cmd && category) {
      if (!guildconfig.disabledCategories) guildconfig.disabledCategories = [];
      if (!guildconfig.disabledCategories.includes(category)) {
        return this.bot.embed("❌ Error", "That category is already enabled.", msg, "error");
      }

      // Updates DB
      guildconfig.disabledCategories.splice(guildconfig.disabledCategories.indexOf(category), 1);
      await this.bot.db.table("guildconfig").get(msg.channel.guild.id).update(guildconfig).run();
      this.bot.emit("categoryEnable", msg.channel.guild, msg.member, category);
      return this.bot.embed("✅ Success", `The **${category}** category has been enabled.`, msg, "success");
    }

    // If not found or is already enabled
    if (!cmd) return this.bot.embed("❌ Error", "That command doesn't exist.", msg, "error");
    if (!guildconfig.disabledCmds) guildconfig.disabledCmds = [];
    if (guildconfig.disabledCmds && !guildconfig.disabledCmds.includes(cmd.id)) {
      return this.bot.embed("❌ Error", "That command isn't disabled.", msg, "error");
    }

    if (cmd) {
      // Updates db
      guildconfig.disabledCmds.splice(guildconfig.disabledCmds.indexOf(cmd.id), 1);
      await this.bot.db.table("guildconfig").get(msg.channel.guild.id).update(guildconfig).run();
      this.bot.emit("commandEnable", msg.channel.guild, msg.member, command);
      this.bot.embed("✅ Success", `The **${cmd.id}** command has been enabled.`, msg, "success");
    } else {
      this.bot.embed("❌ Error", "That doesn't exist or it isn't disabled.", msg, "error");
    }
  }
}

module.exports = enableCommand;
