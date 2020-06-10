const Command = require("structures/Command");

class enableCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<item:string>",
      description: "Enables a command or category.",
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
      await this.bot.db.table("guildcfg").insert({ id: msg.channel.guild.id, disabledCmds: [], disabledCategories: [] });
      guildcfg = { id: msg.channel.guild.id, disabledCmds: [], disabledCategories: [] };
    }

    // Looks for cmd/category
    const cmd = cmds.find(c => (c.id === command || c.aliases.includes(command)) && c.allowdisable);
    const category = categories.find(c => c.toLowerCase() === command.toLowerCase());
    if (!cmd && category) {
      if (!guildcfg.disabledCategories) guildcfg.disabledCategories = [];
      if (!guildcfg.disabledCategories.includes(category)) return msg.channel.createMessage(this.bot.embed("❌ Error", "That category is already enabled.", "error"));
      // Updates DB
      guildcfg.disabledCategories.splice(guildcfg.disabledCategories.indexOf(category), 1);
      await this.bot.db.table("guildcfg").get(msg.channel.guild.id).update(guildcfg);
      this.bot.emit("categoryEnable", msg.channel.guild, msg.member, category);
      return msg.channel.createMessage(this.bot.embed("✅ Success", `The **${category}** category has been enabled.`, "success"));
    }

    // If cmd not found or is already disabled
    if (!cmd) return msg.channel.createMessage(this.bot.embed("❌ Error", "That command doesn't exist.", "error"));
    if (!guildcfg.disabledCmds) guildcfg.disabledCmds = [];
    if (guildcfg.disabledCmds && !guildcfg.disabledCmds.includes(cmd.id)) return msg.channel.createMessage(this.bot.embed("❌ Error", `That command isn't disabled.`, "error"));

    if (cmd) {
      guildcfg.disabledCmds.splice(guildcfg.disabledCmds.indexOf(cmd.id), 1);
      await this.bot.db.table("guildcfg").get(msg.channel.guild.id).update(guildcfg);
      this.bot.emit("commandEnable", msg.channel.guild, msg.member, command);
      msg.channel.createMessage(this.bot.embed("✅ Success", `The **${cmd.id}** command has been enabled.`, "success"));
    } else {
      msg.channel.createMessage(this.bot.embed("❌ Error", "That doesn't exist or it isn't disabled.", "error"));
    }
  }
}

module.exports = enableCommand;
