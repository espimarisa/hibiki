import type { Message } from "discord.js";
import { HibikiCommand } from "../../classes/Command";
import { clean } from "../../utils/strings";
import util from "node:util";

export class EvalCommand extends HibikiCommand {
  description = "Evaluates some code.";
  messageOnly = true;
  ownerOnly = true;

  public async runWithMessage(msg: Message, args: string[]) {
    try {
      const evaluated = await eval(`(async () => {\n${args.join(" ")}\n})()`);
      const evalstring = typeof evaluated === "string" ? evaluated : util.inspect(evaluated);
      const returning = `\`\`\`js\n${clean(evalstring)}\n\`\`\``;
      await msg.reply(returning);
    } catch (error) {
      await msg.reply((error as Error).message);
      console.error(error);
    }
  }

  public async runWithInteraction(): Promise<void> {
    throw new Error("This is a message-only command. If you are seeing this, something has seriously gone wrong.");
  }
}
