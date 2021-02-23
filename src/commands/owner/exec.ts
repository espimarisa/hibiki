import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import child from "child_process";
import axios from "axios";

export class ExecCommand extends Command {
  description = "Executes native commands on the host.";
  args = "[command:string]";
  allowdms = true;
  allowdisable = false;
  owner = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    child.exec(args.join(" "), async (error, stderr, stdout) => {
      if (stdout?.length < 1000) return msg.createEmbed(msg.string("global.SUCCESS"), `\`\`\`\n${stdout || stderr}\n\`\`\``, "success");

      // Uploads if over embed limit; DMs author
      const dmchannel = await msg.author.getDMChannel();
      if (stdout?.length > 2000 || stderr?.length > 2000) {
        const body = await axios.post("https://pastie.io/documents", stdout || stderr);
        await dmchannel.createMessage(`https://pastie.io/${body.data.key}`);
      } else if (stderr?.length < 2000) {
        msg.createEmbed(msg.string("global.ERROR"), `\`\`\`\n${stdout || stderr}\n\`\`\``, "error");
      }
    });
  }
}
