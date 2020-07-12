const Command = require("../../structures/Command");
const child = require("child_process");
const fetch = require("node-fetch");

class execCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Executes commands on the host.",
      allowdisable: false,
      owner: true,
    });
  }

  run(msg, args) {
    child.exec(args.join(" "), async (stdout, stderr) => {
      if (stderr) return this.bot.embed("✅ Success", stderr, msg, "success");

      // Uploads if over embed limit; DMs author
      const dmchannel = await msg.author.getDMChannel();
      if (stderr.length > 2000) {
        const body = await fetch("https://hasteb.in/documents", {
          referrer: "https://hasteb.in/",
          body: evalstring,
          method: "POST",
          mode: "cors",
        }).then(res => res.json().catch(() => {}));

        await dmchannel.createMessage(`https://hasteb.in/${body.key}`);
      } else {
        this.bot.embed("❌ Error", `\`\`\`\n${stdout}\n\`\`\``, msg, "error");
      }
    });
  }
}

module.exports = execCommand;
