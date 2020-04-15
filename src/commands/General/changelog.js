// todo - use github releases for changelogs instead of CHANGELOG.md
// this command will post the latest release's url once the bot is FOSS
const Command = require("../../lib/structures/Command");
const { readFileSync } = require("fs");

class changelogCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["cl", "clog", "updates", "whatsnew"],
      description: "Sends the latest version's changelog.",
      cooldown: 3,
    });
  }

  run(msg) {
    let pLog = [];
    // Reads changelog file
    const clog = readFileSync(`${process.cwd()}/CHANGELOG.md`, "UTF8").split("\n");
    let ver = 0;
    clog.forEach(c => {
      // Newlines
      if (c.indexOf("\r") === c.length - 1 && c.length !== 1) c = c.substring(0, c.length - 1);
      // Only shows the latest version
      if (/# v[0-9].[0-9].[0-9] - [a-zA-Z, 0-9()]{1,100}/.test(c) && ver <= 1) ver++;
      if (ver > 1) return;
      // Headings
      if (c.startsWith("# ")) pLog.push(`**${c.substring(2, c.length)}**`);
      else if (c.startsWith("## ") && !c.startsWith("# ")) pLog.push(`**${c.substring(3, c.length)}**`);
      else if (c.startsWith("### ") && !c.startsWith("## ") && !c.startsWith("# ")) pLog.push(c.substring(4, c.length));
      else if (c.startsWith("#### ") && !c.startsWith("### ") && !c.startsWith("## ") && !c.startsWith("# ")) pLog.push(c.substring(5, c.length));
      else if (c.startsWith("  - ")) pLog.push(`\`➡️\` ${c.substring(4)}`);
      // Ignores comments
      else if (c.startsWith("<!-")) return;
      else pLog.push(c);
    });
    // Sends the changelog
    msg.channel.createMessage(this.bot.embed("📚 Changelog", pLog.join("\n")))
  }
}

module.exports = changelogCommand;
