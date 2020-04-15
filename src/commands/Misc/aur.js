const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");
const waitFor = require("../../lib/utils/waitFor");
const format = require("../../lib/scripts/Format");

class aurCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Looks up packages on the AUR.",
      args: "<name:string>",
      cooldown: 2,
    });
  }

  async run(msg, args) {
    let res = await fetch(`https://aur.archlinux.org/rpc/?v=5&type=search&arg=${args.join(" ")}`);
    res = await res.json();
    console.log(res.results);
    let pkg;
    if (res.resultcount == 1) {
      pkg = res.results[0];
    } else if (res.resultcount > 1) {
      let emsg = await msg.channel.createMessage({
        embed: {
          title: "Multiple packages match your keyword",
          description: res.results.map((r, i) => `**${i + 1}**: ${r.Name} (${r.Popularity.toFixed(2)}%)`).join("\n"),
        },
      })
      await waitFor("messageCreate", 60000, async (m) => {
        if (m.author.id != msg.author.id) return;
        if (m.channel.id != msg.channel.id) return;
        if (!m.content) return;
        let foundpkg = isNaN(m.content) ? res.results.find(r => r.Name.toLowerCase() == m.content.toLowerCase()) : res.results[parseInt(m.content) - 1];

        if (!foundpkg) {
          let message = await msg.channel.createMessage(this.bot.embed("❌ Invalid", "invalid thing", "error"));
          setTimeout(() => {
            message.delete();
          }, 2000);
          return;
        }
        pkg = foundpkg;
        return true;
      }, this.bot).catch(err => err.message == "timeout" && emsg.edit(this.bot.embed("timeout", "1 min timeout ran out", "error")));
    }

    if (!pkg) return msg.channel.createMessage("no pkg");

    let pkginfo = await fetch(`https://aur.archlinux.org/rpc/?v=5&type=info&arg=${pkg.Name}`);
    pkginfo = await pkginfo.json();
    pkginfo = pkginfo.results.find(p => p.Name == pkg.Name);

    msg.channel.createMessage({
      embed: {
        title: `${pkg.Name} ${pkg.Version}`,
        description: pkg.Description,
        fields: [{
          name: "Votes",
          value: pkg.NumVotes,
          inline: true
        }, {
          name: "Popularity",
          value: pkg.Popularity.toFixed(2),
          inline: true
        }, {
          name: "Maintainer",
          value: pkg.Maintainer || "None",
          inline: true
        }, {
          name: "First Submitted",
          value: format.date(pkg.FirstSubmitted * 1000),
          inline: true
        }, {
          name: "Last Updated",
          value: format.date(pkg.LastModified * 1000),
          inline: true
        }, {
          name: "Dependencies",
          value: [...pkginfo.Depends, ...pkginfo.MakeDepends].join(", ") || "None",
          inline: true
        }]
      }
    })
  }
}

module.exports = aurCommand;
