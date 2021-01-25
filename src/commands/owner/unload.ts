import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class UnloadCommand extends Command {
  description = "Unloads a command.";
  args = "<command:string>";
  allowdms = true;
  allowdisable = false;
  owner = true;

  run(msg: Message<TextChannel>, _pargs: ParsedArgs, args: string[]) {
    const query = args.join(" ").toLowerCase();
    const command = this.bot.commands.find((c) => c.name === query || c.aliases.includes(query));
    if (!command) return msg.createEmbed(msg.string("global.ERROR"), msg.string("owner.LOGS_NOTFOUND"), "error");

    delete require.cache[require.resolve(`../${command.category}/${command.name}`)];
    const index = this.bot.commands.indexOf(command);
    if (index !== -1) this.bot.commands.splice(index, 1);
    msg.createEmbed(msg.string("global.SUCCESS"), `**${command.name}** was unloaded.`, "success");
  }
}
