const Command = require("../../lib/structures/Command");

class reloadCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["rl"],
      args: "<command:module&ignore=*>",
      description: "Reloads one or more commands.",
      allowdisable: false,
      owner: true,
    });
  }

  async run(msg, args, pargs) {
    // Reload all functionality
    if (args[0] === "*") {
      let errors = [];
      this.bot.commands.map(c => ({ id: c.id, reload: c.reload })).forEach(cmd => {
        let r = cmd.reload();
        if (r !== "reloaded") errors.push({ id: cmd.id, error: r });
      });
      // Sends any errors
      return msg.channel.createMessage(this.bot.embed("🔄 Reload", errors.length ? errors.map(e => `**${e.id}**: \`\`\`js\n${e.error}\`\`\``).join("\n") : "All commands were reloaded."));
    }
    // Reloads
    let r = pargs[0].value.reload();
    // Sends when reloaded
    if (r === "reloaded") msg.channel.createMessage(this.bot.embed("🔄 Reload", `**${pargs[0].value.id}** was reloaded.`, "success"));
    else msg.channel.createMessage(this.bot.embed("🔄 Reload", `Error while reloading: ${r}`, "error"));
  }
}

module.exports = reloadCommand;
