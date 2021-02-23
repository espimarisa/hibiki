import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { execSync } from "child_process";

export class ReloadCommand extends Command {
  description = "Reloads a command.";
  args = "<command:string>";
  allowdisable = false;
  allowdms = true;
  owner = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    // Warn us if we're in nodemon
    if (process.env.NODE_ENV === "development") {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("owner.RELOAD_NODEMON"), "error");
    }

    // Recompiles everything
    // NOTE: It's possible to pass CLI params to be more precise.
    // But, I am lazy. Deal with it.
    execSync("tsc");

    // Finds the command to reload
    if (args.join(" ").toLowerCase() === "*" || args.join(" ").toLowerCase() === "all") args = this.bot.commands.map((c) => c.name);
    const success: string[] = [];
    const fail: Record<string, string>[] = [];

    // Reloads
    args.forEach((arg) => {
      let command;

      // Looks for the command
      const cmd = this.bot.commands.find((c) => c.name === arg.toLowerCase() || c.aliases.includes(arg.toLowerCase()));

      // Sends if there's no command
      if (!cmd) return fail.push({ id: arg.toLowerCase(), error: msg.string("owner.COMMAND_NOTFOUND") });

      // Deletes the cache
      const oldmodule = require(`../${cmd.category}/${cmd.name}`);
      delete require.cache[require.resolve(`../${cmd.category}/${cmd.name}`)];
      try {
        // Requires the new command
        command = require(`../${cmd.category}/${cmd.name}`);
      } catch (err) {
        // Loads old command if errored
        fail.push({ id: cmd.name, error: err });
        this.bot.commands.push(new oldmodule[Object.keys(oldmodule)[0]](this.bot, cmd.name, cmd.category));
      }

      // Success list
      if (command) {
        const index = this.bot.commands.indexOf(cmd);
        if (index !== -1) this.bot.commands.splice(index, 1);
        this.bot.commands.push(new command[Object.keys(command)[0]](this.bot, cmd.name, cmd.category));
        success.push(cmd.name);
      }
    });

    msg.createEmbed(
      `🔄 ${(msg.string("owner.RELOAD_RELOADED"), { commands: success.length })}`,
      fail.length > 0 ? fail.map((failedcmd) => `**${failedcmd.id}**: \`\`\`js\n${failedcmd.error}\`\`\``).join("\n") : null,
      fail.length > 0 ? "error" : "success",
    );
  }
}
