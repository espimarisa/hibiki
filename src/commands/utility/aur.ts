import type { EmbedField, Message, TextChannel } from "eris";
import type { AURPackageData } from "../../typings/endpoints";
import { Command } from "../../classes/Command";
import { resError } from "../../utils/exception";
import { dateFormat } from "../../utils/format";
import { timeoutHandler, waitFor } from "../../utils/waitFor";
import axios from "axios";

export class aurCommand extends Command {
  description = "Looks for a package on the Arch Linux User Repository (AUR)";
  args = "<query:string>";
  aliases = ["arch"];
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[], args: string[]) {
    const query = encodeURIComponent(args.join(" ").toLowerCase());
    const body = await axios.get(`https://aur.archlinux.org/rpc/?v=5&type=search&arg=${query}`).catch((err) => {
      resError(err);
    });

    let pkg: AURPackageData;

    // Sends if nothing is found
    if (!body || !body.data || !body?.data?.results || !body?.data?.results?.length) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("utility.PACKAGE_NOTFOUND"), "error");
    }

    // Single result
    if (body.data.resultcount === 1) {
      pkg = body.data.results[0];
    } else if (body.data.resultcount > 1) {
      // Sort packages by vote amount
      body.data.results = body.data.results.sort((a: AURPackageData, b: AURPackageData) => b.Popularity - a.Popularity);
      body.data.results.length = 15;

      // Sends multiple results message
      const aurmsg = await msg.createEmbed(
        `🔎 ${msg.string("utility.MULTIPLE_RESULTS")}`,
        body.data.results.map((r: AURPackageData, i: number) => `**${i + 1}:** ${r.Name}`).join("\n"),
      );

      // Waits for a response
      await waitFor(
        "messageCreate",
        15000,
        async (m: Message<TextChannel>) => {
          if (m.author.id !== msg.author.id) return;
          if (m.channel.id !== msg.channel.id) return;
          if (!m.content) return;
          const foundpkg = isNaN(parseInt(m.content))
            ? body.data.results.find((r: AURPackageData) => r?.Name.toLowerCase() === m.content.toLowerCase())
            : body.data.results[parseInt(m.content) - 1];

          pkg = foundpkg;
          return true;
        },

        this.bot,
      ).catch((err) => timeoutHandler(err, aurmsg, msg.string, false));
      if (!pkg && aurmsg) return;
    }

    // If no package was found
    if (!pkg) return msg.createEmbed(msg.string("global.ERROR"), msg.string("utility.PACKAGE_NOTFOUND"), "error");
    const pkginfoReq = await axios.get(`https://aur.archlinux.org/rpc/?v=5&type=info&arg=${pkg.Name}`).catch(() => {});

    // Sends if nothing is found
    if (!pkginfoReq || !pkginfoReq.data) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("utility.PACKAGE_NOTFOUND"), "error");
    }

    // Finds the package
    const pkginfo = pkginfoReq.data.results.find((p: AURPackageData) => p.Name === pkg.Name) as AURPackageData;

    // Embed construct
    const fields: EmbedField[] = [];
    let depends: Array<string>[] = [];

    // # of votes
    if (pkg.num) {
      fields.push({
        name: msg.string("utility.VOTES"),
        value: `${pkg.NumVotes}`,
        inline: true,
      });
    }

    // Maintainers
    if (pkg.Maintainer)
      fields.push({
        name: msg.string("utility.MAINTAINERS"),
        value: `${pkg.Maintainer}`,
        inline: true,
      });

    // Creation
    if (pkg.FirstSubmitted)
      fields.push({
        name: msg.string("utility.CREATED_AT"),
        value: dateFormat(pkg.FirstSubmitted * 1000, msg.string),
        inline: true,
      });

    // Modification date
    if (pkg.LastModified)
      fields.push({
        name: msg.string("utility.UPDATED_AT"),
        value: dateFormat(pkg.LastModified * 1000, msg.string),
        inline: true,
      });

    // Dependencies
    if (pkginfo) {
      if (pkginfo.Depends) depends = [...depends, pkginfo.Depends];
      if (pkginfo.MakeDepends) depends = [...depends, pkginfo.MakeDepends];
    }

    // Dependencies
    if (depends.length) {
      fields.push({
        name: msg.string("utility.DEPENDENCIES"),
        value: `${depends.join(", ")}`,
        inline: false,
      });
    }

    msg.channel.createMessage({
      embed: {
        title: `📦 ${pkg.Name} ${pkg.Version}`,
        description: pkg.Description,
        color: 0x1793d1,
        fields: fields,
        footer: {
          text: `${msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) })}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
