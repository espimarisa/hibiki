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

  run(msg, args, pargs) {
    // Reload all functionality
    if (args[0] === "*") {
      const errors = [];
      this.bot.commands.map(c => ({ id: c.id, reload: c.reload })).forEach(cmd => {
        const r = cmd.reload();
        if (r !== "reloaded") errors.push({ id: cmd.id, error: r });
      });
      return msg.channel.createMessage(this.bot.embed("🔄 Reload", errors.length ? errors.map(e => `**${e.id}:** \`\`\`js\n${e.error}\`\`\``).join("\n") : "Reloaded all commands."));
    }

    // Reloads
    const r = pargs[0].value.reload();
    if (r === "reloaded") msg.channel.createMessage(this.bot.embed("🔄 Reload", `**${pargs[0].value.id}** was reloaded.`, "success"));
    else msg.channel.createMessage(this.bot.embed("🔄 Reload", `Error while reloading: ${r}`, "error"));
  }
}

module.exports = reloadCommand;
