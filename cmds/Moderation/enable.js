const Command = require("../../lib/structures/Command");

class enableCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[item:string]",
      description: "Enables a command or category.",
      allowdisable: false,
      staff: true,
    });
  }

  async run(msg, [command]) {
    // Gets the server's ID
    let guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);
    if (!command) {
      let disabledCmds = [];
      let disabledCategories = [];
      if (guildcfg && guildcfg.disabledCmds && guildcfg.disabledCmds.length) disabledCmds = guildcfg.disabledCmds;
      // Categories
      if (guildcfg && guildcfg.disabledCategories && guildcfg.disabledCategories.length) {
        disabledCategories = guildcfg.disabledCategories.map(cat => `**${cat}**`);
      }
      // List of disabled commands
      return msg.channel.createMessage(this.bot.embed(`🚫 Disabled ${disabledCmds.length === 0 && disabledCategories.length > 0 ? "Categories" : "Commands"}`, disabledCmds.length || disabledCategories.length ? [...disabledCmds, disabledCategories].join(", ") : "No commands or categories are disabled."));
    }

    // If no command name is given, error out, else continue
    const cmds = this.bot.commands.filter(cmd => cmd.allowdisable);
    const categories = [];
    this.bot.commands.forEach(c => categories.includes(c.category) && c.category !== "Owner" ? "filler" : categories.push(c.category));

    if (!guildcfg) {
      // Inserts blank cfg
      await this.bot.db.table("guildcfg").insert({ id: msg.channel.guild.id, disabledCmds: [], disabledCategories: [] });
      guildcfg = { id: msg.channel.guild.id, disabledCmds: [], disabledCategories: [] };
    }

    // Looks for cmd/category
    const cmd = cmds.find(c => (c.id === command || c.aliases.includes(command)) && c.allowdisable);
    const category = categories.find(c => c.toLowerCase() === command.toLowerCase());
    // If it's a cmd & category
    if (!cmd && category) {
      if (!guildcfg.disabledCategories) guildcfg.disabledCategories = [];

      // Already enabled
      if (!guildcfg.disabledCategories.includes(category)) {
        return msg.channel.createMessage(this.bot.embed("❌ Error", "That category is already enabled.", "error"));
      }

      // Updates DB
      guildcfg.disabledCategories.splice(guildcfg.disabledCategories.indexOf(category), 1);
      await this.bot.db.table("guildcfg").get(msg.channel.guild.id).update(guildcfg);
      // Sends the embed
      return msg.channel.createMessage(this.bot.embed("✅ Success", `The **${category}** category has been enabled.`, "success"));
    }

    // Invalid command
    if (cmd === undefined) return msg.channel.createMessage(this.bot.embed("❌ Error", "That command doesn't exist.", "error"));
    if (!guildcfg.disabledCmds) guildcfg.disabledCmds = [];

    // Already disabled
    if (guildcfg.disabledCmds && !guildcfg.disabledCmds.includes(cmd.id)) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `That command isn't disabled.`, "error"));
    }

    if (cmd) {
      // Updates DB
      guildcfg.disabledCmds.splice(guildcfg.disabledCmds.indexOf(cmd.id), 1);
      await this.bot.db.table("guildcfg").get(msg.channel.guild.id).update(guildcfg);
      msg.channel.createMessage(this.bot.embed("✅ Success", `The **${cmd.id}** command has been enabled.`, "success"));
    } else {
      msg.channel.createMessage(this.bot.embed("❌ Error", "That doesn't exist or it isn't disabled.", "error"));
    }
  }
}

module.exports = enableCommand;
