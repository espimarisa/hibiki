const Command = require("../../structures/Command");

class reloadCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["rl"],
      args: "<command:string>",
      description: "Reloads one or more commands.",
      allowdisable: false,
      owner: true,
    });
  }

  run(msg, args) {
    // Looks for the command; reloads all if "all" is given
    if (args.join(" ").toLowerCase() === "*" || (args.join(" ").toLowerCase() === "all")) args = this.bot.commands.map(c => c.id);
    const success = [];
    const fail = [];

    // Reloads
    args.forEach(arg => {
      let command;

      // Looks for the command
      const cmd = this.bot.commands.find(c => c.id === arg.toLowerCase() || c.aliases.includes(arg.toLowerCase()));

      // Sends if there's no command
      if (!cmd) return fail.push({ id: arg.toLowerCase(), error: "Command not found." });

      // Deletes the cache
      const oldmodule = require(`../${cmd.category}/${cmd.id}`);
      delete require.cache[require.resolve(`../${cmd.category}/${cmd.id}`)];
      try {
        // Loads the command
        command = require(`../${cmd.category}/${cmd.id}`);
      } catch (err) {
        fail.push({ id: cmd.id, error: err });
        // Loads the old command if needed
        this.bot.commands.push(new oldmodule(this.bot, cmd.category, cmd.id));
      }

      // Success list
      if (command) {
        const index = this.bot.commands.indexOf(cmd);
        if (index !== -1) this.bot.commands.splice(index, 1);
        this.bot.commands.push(new command(this.bot, cmd.category, cmd.id));
        success.push(cmd.id);
      }
    });

    return msg.channel.createMessage({
      embed: {
        title: `🔄 Reloaded ${success.length === 1 ? success[0] : `${success.length} commands`}.`,
        description: fail.length > 0 ? fail.map(failedcmd => `**${failedcmd.id}**: \`\`\`js\n${failedcmd.error}\`\`\``).join("\n") : null,
        color: fail.length > 0 ? this.bot.embed.color("error") : this.bot.embed.color("success"),
      },
      footer: {
        text: `Ran by ${this.bot.tag(msg.author)}`,
        icon_url: msg.author.dynamicAvatarURL(),
      },
    });
  }
}

module.exports = reloadCommand;
