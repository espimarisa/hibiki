const Command = require("structures/Command");
const fetch = require("node-fetch");
const format = require("utils/format");
const waitFor = require("utils/waitFor");

class aurCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<package:string>",
      description: "Looks up packages on the AUR.",
      cooldown: 3,
    });
  }

  async run(msg, args) {
    let res = await fetch(`https://aur.archlinux.org/rpc/?v=5&type=search&arg=${args.join(" ")}`);
    res = await res.json();
    let pkg;
    if (res.resultcount === 1) {
      pkg = res.results[0];
    } else if (res.resultcount > 1) {
      // Sort packages by vote amount
      res.results = res.results.sort((a, b) => a.NumVotes - b.NumVotes);
      res.results.length = 15;

      const aurmsg = await this.bot.embed(
        "📦 Multiple Results",
        res.results.map((r, i) => `**${i + 1}:** ${r.Name} (${r.Popularity.toFixed(2)}%)`).join("\n"),
        msg,
      );

      await waitFor("messageCreate", 60000, async (m) => {
        if (m.author.id !== msg.author.id) return;
        if (m.channel.id !== msg.channel.id) return;
        if (!m.content) return;
        const foundpkg = isNaN(m.content) ? res.results.find(r => r.Name.toLowerCase() === m.content.toLowerCase()) :
          res.results[parseInt(m.content) - 1];

        if (!foundpkg) {
          const message = await this.bot.embed("❌ Error", "Invalid package", msg, "error");
          setTimeout(() => {
            message.delete();
          }, 2000);
          return;
        }

        pkg = foundpkg;
        return true;
      }, this.bot).catch(err => err.message === "timeout" &&
        this.bot.embed.edit("❌ Error", "Timeout reached.", aurmsg, "error"));
    }

    // If no package was found
    if (!pkg) return this.bot.embed("❌ Error", "No packages found.", msg, "error");
    let pkginfo = await fetch(`https://aur.archlinux.org/rpc/?v=5&type=info&arg=${pkg.Name}`);
    pkginfo = await pkginfo.json();
    pkginfo = pkginfo.results.find(p => p.Name === pkg.Name);

    const fields = [];
    let depends = [];
    if (pkg.numvotes) fields.push({ name: "Votes", value: pkg.NumVotes, inline: true });
    if (pkg.Popularity) fields.push({ name: "Popularity", value: pkg.Popularity.toFixed(2), inline: true });
    if (pkg.Maintainer) fields.push({ name: "Maintainer", value: pkg.Maintainer, inline: true });
    if (pkg.FirstSubmitted) fields.push({ name: "Submitted", value: format.date(pkg.FirstSubmitted * 1000), inline: true });
    if (pkg.LastModified) fields.push({ name: "Updated", value: format.date(pkg.LastModified * 1000), inline: true });

    if (pkginfo) {
      if (pkginfo.Depends) depends = [...depends, pkginfo.Depends];
      if (pkginfo.MakeDepends) depends = [...depends, pkginfo.MakeDepends];
    }

    if (depends.length) fields.push({ name: "Dependencies", value: depends.join(", ") });


    msg.channel.createMessage({
      embed: {
        title: `📦 ${pkg.Name} ${pkg.Version}`,
        description: pkg.Description,
        color: 0x1793D1,
        fields: fields,
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = aurCommand;
