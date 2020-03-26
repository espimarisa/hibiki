const Command = require("../../lib/structures/Command");

class pingcmd extends Command {
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
    // Sends when unloaded
    let r = pargs[0].value.unload();
    if(r == "unloaded") msg.channel.createMessage(this.bot.embed("🔄 Unload", `**${pargs[0].value.id}** was unloaded.`, "success"));
    else msg.channel.createMessage(this.bot.embed("🔄 Unload", `there was prob an error: ${r}`, "error"));
  }
}

module.exports = pingcmd;
