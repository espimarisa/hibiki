import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class test3Command extends Command {
  description = "";
  clientperms = [""];
  requiredperms = [""];
  args = "";
  aliases = [""];
  cooldown = 0;
  allowdms = false;
  nsfw = false;
  staff = false;
  owner = false;
  voice = false;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs, args: string[]) {}
}
