/**
 * @file Dice command
 * @description Rolls a given-sided die (defaults to 6; maximum is 120)
 */

import type { Message, TextChannel } from "eris";

import { Command } from "../../classes/Command";

export class DiceCommand extends Command {
  description = "Rolls an x sided die (defaults to 6; maximum is 120).";
  args = "[sides:string]";
  aliases = ["die", "rolldice", "rolldice"];
  allowdms = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    // Calculates the amount of sides to use. Default to 6, clamps to 120.
    let sides = parseInt(args.join(" "));
    if (!sides) sides = 6;
    else if (sides > 120) sides = 120;
    else if (sides < 2) sides = 6;

    const num = Math.floor(Math.random() * sides) + 1;
    msg.createEmbed(`🎲 ${msg.locale("fun.DICE")}`, msg.locale("fun.DICE_RESULT", { sides, result: num }));
  }
}
