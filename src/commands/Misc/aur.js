const Command = require("../../lib/structures/Command");
const Wait = require("../../lib/utils/Wait");
const fetch = require("node-fetch");
const format = require("../../lib/scripts/Format");

class aurCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Looks up packages on the AUR.",
      args: "<package:string>",
      cooldown: 2,
    });
  }

  async run(msg, args) {
    // Fetches the API
    let res = await fetch(`https://aur.archlinux.org/rpc/?v=5&type=search&arg=${args.join(" ")}`);
    res = await res.json();
    let pkg;
    if (res.resultcount === 1) {
      pkg = res.results[0];
    } else if (res.resultcount > 1) {
      // Sort packages by vote amount
      res.results = res.results.sort((a, b) => a.NumVotes - b.NumVotes);
      res.results.length = 15;
      // Sends original message
      const aurmsg = await msg.channel.createMessage(this.bot.embed("📦 Multiple Results", res.results.map((r, i) => `**${i + 1}**: ${r.Name} (${r.Popularity.toFixed(2)}%)`).join("\n")));
      // Wait event
      await Wait("messageCreate", 60000, async (m) => {
        if (m.author.id !== msg.author.id) return;
        if (m.channel.id !== msg.channel.id) return;
        if (!m.content) return;
        const foundpkg = isNaN(m.content) ? res.results.find(r => r.Name.toLowerCase() === m.content.toLowerCase()) : res.results[parseInt(m.content) - 1];
        // Invalid package
        if (!foundpkg) {
          const message = await msg.channel.createMessage(this.bot.embed("❌ Error", "Invalid package", "error"));
          setTimeout(() => {
            message.delete();
          }, 2000);
          return;
        }
        pkg = foundpkg;
        return true;
        // Timeout
      }, this.bot).catch(err => err.message === "timeout" && aurmsg.edit(this.bot.embed("❌ Error", "The **1 minute timeout** has been reached.", "error")));
    }

    // No package found
    if (!pkg) return msg.channel.createMessage(this.bot.embed("❌ Error", "No packages found.", "error"));
    let pkginfo = await fetch(`https://aur.archlinux.org/rpc/?v=5&type=info&arg=${pkg.Name}`);
    pkginfo = await pkginfo.json();
    pkginfo = pkginfo.results.find(p => p.Name === pkg.Name);

    // Sets the fields
    const fields = [];
    if (pkg.numvotes) fields.push({ name: "Votes", value: pkg.NumVotes, inline: true });
    if (pkg.Popularity) fields.push({ name: "Popularity", value: pkg.Popularity.toFixed(2), inline: true });
    if (pkg.Maintainer) fields.push({ name: "Maintainer", value: pkg.Maintainer, inline: true });
    if (pkg.FirstSubmitted) fields.push({ name: "Submitted", value: format.date(pkg.FirstSubmitted * 1000), inline: true });
    if (pkg.LastModified) fields.push({ name: "Updated", value: format.date(pkg.LastModified * 1000), inline: true });
    if (pkginfo && (pkginfo.Depends || pkginfo.MakeDepends)) fields.push({ name: "Dependencies", value: [...pkginfo.Depends, ...pkginfo.MakeDepends].join(", ") || "None" });
    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: `📦 ${pkg.Name} ${pkg.Version}`,
        description: pkg.Description,
        color: 0x1793D1,
        fields: fields,
      },
    });
  }
}

module.exports = aurCommand;
