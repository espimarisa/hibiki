import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { existsSync } from "fs";

export class LoadCommand extends Command {
  description = "Loads a command.";
  args = "<command:string>";
  allowdisable = false;
  allowdms = true;
  owner = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    let command: Command;
    let category: string;

    // Warn us if we're in nodemon
    if (process.env.NODE_ENV === "development") {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("owner.RELOAD_NODEMON"), "error");
    }

    try {
      const categories: string[] = [];
      this.bot.commands.forEach((cmd) => {
        if (!categories.includes(cmd.category)) categories.push(cmd.category);
      });

      // Looks for the correct category
      categories.forEach((c) => {
        if (existsSync(`${process.cwd()}/dist/src/commands/${c}/${args.join(" ")}.js`)) category = c;
      });

      // Loads the command file
      command = require(`../${category}/${args.join(" ")}`);

      const commandToLoad = new command[Object.keys(command)[0]](this.bot, args.join(" "), category);
      this.bot.commands.push(commandToLoad);
      msg.createEmbed(msg.string("global.SUCCESS"), msg.string("owner.LOAD_LOADED", { command: args.join(", ") }), "success");
    } catch (err) {
      msg.createEmbed(msg.string("global.ERROR"), `\n\`\`\`js\n${err}\n\`\`\``, "error");
    }
  }
}
