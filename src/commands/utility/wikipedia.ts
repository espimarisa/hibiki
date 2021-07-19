import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import axios from "axios";

export class WikipediaCommand extends Command {
  description = "Returns information about a page from Wikipedia.";
  args = "<query:string>";
  aliases = ["wiki"];
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const query = encodeURIComponent(args.join(" "));

    const body = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${query}`).catch(() => {});

    if (!body || !body.data || body.data.title === "Not found.") {
      return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("utility.WIKIPEDIA_NOTFOUND"), "error");
    }

    // Handles disambiguation pages
    if (body.data.type === "disambiguation") {
      return msg.createEmbed(
        `🌐 ${msg.locale("utility.WIKIPEDIA")}`,
        msg.locale("utility.WIKIPEDIA_DISAMBIGUATION", { page: body.data.content_urls.desktop.page }),
      );
    }

    msg.createEmbed(`🌐 ${msg.locale("utility.WIKIPEDIA")}`, `${body.data.extract}`);
  }
}
