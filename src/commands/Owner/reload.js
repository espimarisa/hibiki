const Command = require("../../lib/structures/Command");

class pingcmd extends Command {
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
    // Sends when reloaded
    let r = pargs[0].value.reload();
    if(r == "reloaded") msg.channel.createMessage(this.bot.embed("🔄 Reload", `**${pargs[0].value.id}** was reloaded.`, "success"));
    else msg.channel.createMessage(this.bot.embed("🔄 Reload", `there was prob an error: ${r}`, "error"));
  }
}

module.exports = pingcmd;
