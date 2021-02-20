import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class DiceCommand extends Command {
  description = "Rolls an x sided die (defaults to 6; maximum is 120).";
  args = "[sides:string]";
  aliases = ["die", "rolldice", "rolldice"];
  allowdms = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    let sides: number;

    // Calculates the amount of sides to use. Default to 6, clamps to 120.
    if (!parseInt(args.join(" "))) sides = 6;
    else if (parseInt(args.join(" ")) > 120) sides = 120;
    else if (parseInt(args.join(" ")) < 2) sides = 6;
    else sides = parseInt(args.join(" "));

    const num = Math.floor(Math.random() * sides) + 1;
    msg.createEmbed(`🎲 ${msg.string("fun.DICE")}`, msg.string("fun.DICE_RESULT", { sides: sides, result: num }));
  }
}
