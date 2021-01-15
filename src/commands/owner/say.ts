import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class SayCommand extends Command {
  description = "Makes the bot say something.";
  args = "<text:string>";
  allowdms = true;
  allowdisable = false;
  owner = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs, args: string[]) {
    await msg.channel.createMessage(args.join(" ")).then(() => {
      msg.delete();
    });
  }
}
