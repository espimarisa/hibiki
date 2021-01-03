import type { Message, TextChannel } from "eris";
import { inspect } from "util";
import { Command } from "../../classes/Command";
import config from "../../../config.json";
import axios from "axios";

export class EvalCommand extends Command {
  description = "Evaluates some code.";
  args = "[code:string]";
  allowdms = true;
  allowdisable = false;
  owner = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs, args: string[]) {
    try {
      const evaluated = await eval(`(async () => {\n${args.join(" ")}\n})()`);
      const evalstring = typeof evaluated === "string" ? evaluated : inspect(evaluated);
      console.log(evalstring);

      // Uploads if over embed limit; DMs author
      const dmchannel = await msg.author.getDMChannel();
      if (evalstring.length > 2000) {
        const body = await axios.post("https://hastebin.com/documents", {
          headers: {
            referrer: "https://hastebin.com/",
            body: evalstring,
            method: "POST",
            mode: "cors",
          },
        });

        await dmchannel.createMessage(`https://hastebin.com/${body.data.key}`);
      } else {
        msg.createEmbed(
          msg.string("global.SUCCESS"),
          `\`\`\`js\n${evalstring.replace(config.token, "Bot token hidden.")}\n\`\`\``,
          "success",
        );
      }
    } catch (err) {
      msg.createEmbed(msg.string("global.ERROR"), `\`\`\`js\n${err.stack}\n\`\`\``, "error");
    }
  }
}
