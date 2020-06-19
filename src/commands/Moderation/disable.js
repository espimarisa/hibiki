const Command = require("structures/Command");

class disableCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<item:string>",
      description: "Disables a command or category.",
      allowdisable: false,
      staff: true,
    });
  }

  async run(msg, [command]) {
    let guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id).run();
    const cmds = this.bot.commands.filter(cmd => cmd.allowdisable);
    const categories = [];
    this.bot.commands.forEach(c => categories.includes(c.category) && c.category !== "Owner" ? "" : categories.push(c.category));

    if (!guildcfg) {
      await this.bot.db.table("guildcfg").insert({
        id: msg.channel.guild.id,
        disabledCmds: [],
        disabledCategories: [],
      }).run();

      guildcfg = { id: msg.channel.guild.id, disabledCmds: [], disabledCategories: [] };
    }

    // Looks for cmd/category
    const cmd = cmds.find(c => (c.id === command || c.aliases.includes(command)));
    const category = categories.find(c => c.toLowerCase() === command.toLowerCase());
    if (!cmd && category) {
      if (!guildcfg.disabledCategories) guildcfg.disabledCategories = [];

      if (category === "Owner" || category === "Core") {
        return this.bot.embed("❌ Error", "That's not allowed to be disabled.", msg, "error");
      }

      if (guildcfg.disabledCategories && guildcfg.disabledCategories.includes(category)) {
        return this.bot.embed("❌ Error", "That's already disabled.", "error");
      }

      // Updates db
      guildcfg.disabledCategories.push(category);
      await this.bot.db.table("guildcfg").get(msg.channel.guild.id).update(guildcfg).run();
      this.bot.emit("categoryDisable", msg.channel.guild, msg.member, category);
      return this.bot.embed("✅ Success", `The **${category}** category have been disabled`, msg, "success");
    }

    // If not found or is already disabled
    if (!cmd) return this.bot.embed("❌ Error", "That command/category doesn't exist.", msg, "error");
    if (!guildcfg.disabledCmds) guildcfg.disabledCmds = [];
    if (guildcfg.disabledCmds && guildcfg.disabledCmds.includes(cmd.id)) {
      return this.bot.embed("❌ Error", "That's already disabled.", msg, "error");
    }

    if (cmd) {
      // Updates db
      guildcfg.disabledCmds.push(cmd.id);
      await this.bot.db.table("guildcfg").get(msg.channel.guild.id).update(guildcfg).run();
      this.bot.emit("commandDisable", msg.channel.guild, msg.member, command);
      this.bot.embed("✅ Success", `The **${cmd.id}** command has been disabled.`, msg, "success");
    } else {
      this.bot.embed("❌ Error", `That isn't allowed to be disabled.`, msg, "error");
    }
  }
}

module.exports = disableCommand;
