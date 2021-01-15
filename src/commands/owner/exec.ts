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

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs, args: string[]) {
    child.exec(args.join(" "), async (stdout, stderr) => {
      if (stderr?.length < 2000) return msg.createEmbed(msg.string("global.SUCCESS"), `\`\`\`\n${stderr}\n\`\`\``, "success");

      // Uploads if over embed limit; DMs author
      const dmchannel = await msg.author.getDMChannel();
      if (stderr.length > 2000) {
        const body = await axios.post("https://hastebin.com/documents", {
          headers: {
            referrer: "https://hastebin.com/",
            body: stderr,
            method: "POST",
            mode: "cors",
          },
        });

        await dmchannel.createMessage(`https://hastebin.com/${body.data.key}`);
      } else if (stderr?.length < 2000) {
        msg.createEmbed(msg.string("global.ERROR"), `\`\`\`\n${stdout}\n\`\`\``, "error");
      }
    });
  }
}
