const Command = require("../../structures/Command");

class loadCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<command:string>",
      description: "Loads a command that's not currently loaded.",
      owner: true,
    });
  }

  run(msg, args) {
    let command;
    let category;

    try {
      const categories = [];
      this.bot.commands.forEach(cmd => {
        if (!categories.includes(cmd.category)) categories.push(cmd.category);
      });

      // Looks for the correct category
      categories.forEach(c => {
        if (require("fs").existsSync(`${process.cwd()}/src/commands/${c}/${args.join(" ")}.js`)) category = c;
      });

      // Loads the command file
      command = require(`../${category}/${args.join(" ")}`);

      // Pushes the command
      const _command = new command(this.bot, category, args.join(" "));
      this.bot.commands.push(_command);
      this.bot.embed("✅ Success", `Loaded \`${args.join(" ")}\` successfully.`, msg, "success");
    } catch (err) {
      this.bot.embed("❌ Error", `\n\`\`\`js\n${err}\n\`\`\``, msg, "error");
    }
  }
}

module.exports = loadCommand;
