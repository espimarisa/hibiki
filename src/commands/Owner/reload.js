const Command = require("../../lib/structures/Command");

class reloadCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["rl"],
      args: "<item:module>",
      description: "Reloads a module.",
      allowdisable: false,
      owner: true,
    });
  }

  async run(msg, args, pargs) {
    // Reloads
    let r = pargs[0].value.reload();
    // Sends when reloaded
    if (r == "reloaded") msg.channel.createMessage(this.bot.embed("🔄 Reload", `**${pargs[0].value.id}** was reloaded.`, "success"));
    else msg.channel.createMessage(this.bot.embed("🔄 Reload", `Error while reloading: ${r}`, "error"));
  }
}

module.exports = reloadCommand;
