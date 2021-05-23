import type { Message, TextChannel } from "eris";
import { inspect } from "util";
import { Command } from "../../classes/Command";
import config from "../../../config.json";
import axios from "axios";

// Hides API keys and the bot token
const tokens: string[] = [config.token];
Object.values(config.keys).forEach((key) => {
  if (typeof key === "object") {
    Object.values(key).forEach((key2: any) => {
      if (key2?.auth) tokens.push(key2.auth);
      else if (key2.length) tokens.push(key2);
    });
  } else if (key.length) tokens.push(key);
});

// Tokens to hide
const tokenRegex = new RegExp(tokens.join("|"), "g");

export class EvalCommand extends Command {
  description = "Evaluates some code.";
  args = "[code:string]";
  allowdms = true;
  allowdisable = false;
  owner = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    try {
      const evaluated = await eval(`(async () => {\n${args.join(" ")}\n})()`);
      const evalstring = typeof evaluated === "string" ? evaluated : inspect(evaluated);
      console.log(evalstring);

      // Uploads if over embed limit; DMs author
      const dmchannel = await msg.author.getDMChannel();
      if (evalstring.length > 2000) {
        const body = await axios.post("https://pastie.io/documents", evalstring);
        await dmchannel.createMessage(`https://pastie.io/${body.data.key}`);
      } else if (evalstring === "true") {
        return msg.channel.createMessage("true!");
      } else {
        // Sends output
        msg.createEmbed(
          msg.string("global.SUCCESS"),
          `\`\`\`js\n${evalstring.replace(tokenRegex, msg.string("owner.TOKEN_HIDDEN"))}\n\`\`\``,
          "success",
        );
      }
    } catch (err) {
      console.error(err);
      msg.createEmbed(
        msg.string("global.ERROR"),
        `\`\`\`js\n${err.stack.replace(tokenRegex, msg.string("owner.TOKEN_HIDDEN"))}\n\`\`\``,
        "error",
      );
    }
  }
}
