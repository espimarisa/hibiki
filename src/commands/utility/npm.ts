import type { EmbedField, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { dateFormat } from "../../utils/format";
import axios from "axios";

export class npmCommand extends Command {
  description = "Searches for a package on npm.";
  args = "<package:string>";
  aliases = ["yarn"];
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const query = encodeURIComponent(args.join(" ").toLowerCase());
    const body = await axios.get(`https://registry.npmjs.com/${query}`).catch(() => {});
    const isYarn = msg.content.toLowerCase().includes("yarn");

    // Sends if nothing is found
    if (!body || !body.data || body.data?.error || !body.data?.["dist-tags"]) {
      return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("utility.PACKAGE_NOTFOUND"), "error");
    }

    // Gets the package info
    const pkg = body.data.versions[body.data["dist-tags"].latest];

    // Embed fields
    const fields: EmbedField[] = [];

    // Keywords
    if (pkg.keywords?.length)
      fields.push({
        name: msg.locale("utility.KEYWORDS"),
        value: `${pkg.keywords.map((k: string) => `\`${k}\``).join(", ")}`,
        inline: false,
      });

    // URL
    fields.push({
      name: msg.locale("global.URL"),
      value: `[https://${isYarn ? "yarnpkg" : "npmjs"}.com/package/${args.join(" ")}](https://www.npmjs.com/package/${args.join(" ")})`,
      inline: false,
    });

    // Latest version
    fields.push({
      name: msg.locale("utility.LATEST_VERSION"),
      value: body.data["dist-tags"].latest,
      inline: true,
    });

    // License with no type
    if (!body.data.license?.type) {
      fields.push({
        name: msg.locale("utility.LICENSE"),
        value: `${body.data.license}`,
        inline: true,
      });
    }

    // License type
    else if (body.data.license?.type) {
      fields.push({
        name: msg.locale("utility.LICENSE"),
        value: `${body.data.license.type}`,
        inline: true,
      });
    }

    // Maintainers
    if (pkg.maintainers?.length)
      fields.push({
        name: msg.locale("utility.MAINTAINERS"),
        value: pkg.maintainers.map((m: Record<string, string>) => `\`${m.name}\``).join(", "),
        inline: false,
      });

    // Created at
    if (body.data.time?.created)
      fields.push({
        name: msg.locale("global.CREATED_AT"),
        value: `${dateFormat(body.data.time.created, msg.locale)}`,
        inline: true,
      });

    // Updated at
    if (body.data.time?.modified)
      fields.push({
        name: msg.locale("global.UPDATED_AT"),
        value: `${dateFormat(body.data.time.modified, msg.locale)}`,
        inline: true,
      });

    msg.channel.createMessage({
      embed: {
        title: `${isYarn ? "🧶" : "📦"} ${pkg.name}`,
        description: pkg.description,
        color: isYarn ? 0x2c8ebb : 0xcc3534,
        fields: fields,
        footer: {
          text: `${msg.locale("global.RAN_BY", { author: msg.tagUser(msg.author) })}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
