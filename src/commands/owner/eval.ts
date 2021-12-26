import type { Message } from "discord.js";
import { HibikiCommand } from "../../classes/Command";
import util from "node:util";

export class EvalCommand extends HibikiCommand {
  description = "Evaluates some code.";
  messageOnly = true;
  owner = true;

  public async runWithMessage(msg: Message, args: string[]) {
    try {
      const evaluated = await eval(`(async () => {\n${args.join(" ")}\n})()`);
      const evalstring = typeof evaluated === "string" ? evaluated : util.inspect(evaluated);
      console.log(evalstring);
      await msg.reply(evalstring);
    } catch (error) {
      await msg.reply((error as Error).message);
      console.error(error);
    }
  }

  public async runWithInteraction() {
    throw new Error("This is a message-only command. If you are seeing this, something has seriously gone wrong.");
  }
}
