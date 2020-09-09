const Command = require("../../structures/Command");

class removecommandCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["delcmd", "delcommand", "deletecmd", "deletecommand", "removecmd"],
      args: "[command:string]",
      description: "Removes a custom command.",
      requiredPerms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args) {
    const guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id).run();

    // List of custom commands
    if (!args.length && guildcfg && guildcfg.customCommands.length) {
      return this.bot.embed("✨ Custom Commands", `${guildcfg.customCommands.map(cmd => `\`${cmd.name}\``).join(", ")}`, msg);
    }

    if (!args.length && !guildcfg || !guildcfg || args.length && guildcfg && !guildcfg.customCommands) {
      return this.bot.embed("❌ Error", "This server has no custom commands.", msg, "error");
    }

    // Find the custom command
    const name = args[0];
    const command = guildcfg.customCommands.find(cmd => cmd.name === name);
    if (!command) return this.bot.embed("❌ Error", `The custom command **${name}** doesn't exist.`, msg, "error");

    // Deletes the command
    guildcfg.customCommands.splice(guildcfg.customCommands.indexOf(command), 1);
    await this.bot.db.table("guildcfg").get(msg.guild.id).update(guildcfg).run();
    this.bot.emit("commandRemove", msg.channel.guild, msg.author, name);
    this.bot.embed("✅ Success", `Successfully deleted command **${name}**.`, msg, "success");
  }
}

module.exports = removecommandCommand;
