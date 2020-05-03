const Command = require("../../lib/structures/Command");

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
    let guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);
    const cmds = this.bot.commands.filter(cmd => cmd.allowdisable);
    const categories = [];
    this.bot.commands.forEach(c => categories.includes(c.category) && c.category !== "Owner" ? "" : categories.push(c.category));

    if (!guildcfg) {
      // Inserts blank cfg
      await this.bot.db.table("guildcfg").insert({ id: msg.channel.guild.id, disabledCmds: [], disabledCategories: [] });
      guildcfg = { id: msg.channel.guild.id, disabledCmds: [], disabledCategories: [] };
    }

    // Looks for cmd/category
    const cmd = cmds.find(c => (c.id === command || c.aliases.includes(command)));
    const category = categories.find(c => c.toLowerCase() === command.toLowerCase());
    if (!cmd && category) {
      if (!guildcfg.disabledCategories) guildcfg.disabledCategories = [];
      // Disalllowed from disable
      if (category === "Owner" || category === "Core") return msg.channel.createMessage(this.bot.embed("❌ Error", "That's not allowed to be disabled.", "error"));
      if (guildcfg.disabledCategories && guildcfg.disabledCategories.includes(category)) return msg.channel.createMessage(this.bot.embed("❌ Error", "That's already disabled.", "error"));
      guildcfg.disabledCategories.push(category);
      // Updates DB
      await this.bot.db.table("guildcfg").get(msg.channel.guild.id).update(guildcfg);
      this.bot.emit("categoryDisable", msg.channel.guild, msg.member, category);
      return msg.channel.createMessage(this.bot.embed("✅ Success", `The **${category}** category have been disabled`, "success"));
    }

    // If cmd not found; already disabled
    if (!cmd) return msg.channel.createMessage(this.bot.embed("❌ Error", "That command/category doesn't exist.", "error"));
    if (!guildcfg.disabledCmds) guildcfg.disabledCmds = [];
    if (guildcfg.disabledCmds && guildcfg.disabledCmds.includes(cmd.id)) return msg.channel.createMessage(this.bot.embed("❌ Error", `That is already disabled.`, "error"));

    if (cmd) {
      // Updates DB
      guildcfg.disabledCmds.push(cmd.id);
      await this.bot.db.table("guildcfg").get(msg.channel.guild.id).update(guildcfg);
      this.bot.emit("commandDisable", msg.channel.guild, msg.member, command);
      msg.channel.createMessage(this.bot.embed("✅ Success", `The **${cmd.id}** command has been disabled.`, "success"));
    } else {
      msg.channel.createMessage(this.bot.embed("❌ Error", `That isn't allowed to be disabled.`, "error"));
    }
  }
}

module.exports = disableCommand;
