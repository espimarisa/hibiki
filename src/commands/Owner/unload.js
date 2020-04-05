const Command = require("../../lib/structures/Command");

class unloadCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["ul"],
      args: "<item:module>",
      description: "Unloads a module.",
      allowdisable: false,
      owner: true,
    });
  }

  async run(msg, args, pargs) {
    // Unloads
    let r = pargs[0].value.unload();
    // Sends when unloaded
    if (r == "unloaded") msg.channel.createMessage(this.bot.embed("🔄 Unload", `**${pargs[0].value.id}** was unloaded.`, "success"));
    else msg.channel.createMessage(this.bot.embed("🔄 Unload", `Error while unloading: ${r}`, "error"));
  }
}

module.exports = unloadCommand;
