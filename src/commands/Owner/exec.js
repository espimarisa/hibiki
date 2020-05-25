const Command = require("../../lib/structures/Command");
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
    try {
      // Tries to execute
      child.exec(args.join(" "), async (stdout, stderr) => {
        if (stderr) return msg.channel.createMessage(this.bot.embed("⚡ Exec", stderr));
        // Uploads if over embed limit
        const dmchannel = await msg.author.getDMChannel();
        if (stdout.length > 2000) {
          const body = await fetch("https://hasteb.in/documents", { referrer: "https://hasteb.in", body: stdout, method: "POST", mode: "cors" })
            .then(async res => await res.json().catch(() => {}));
          await dmchannel.createMessage(this.bot.embed("❌ Error", `Output longer than 2000. View the output [here](https://hasteb.in/${body.key})`, "error"));
        } else {
          msg.channel.createMessage(this.bot.embed("⚡ Exec", `\`\`\`\n${stdout}\n\`\`\``));
        }
      });
    } catch (e) {
      msg.channel.createMessage(this.bot.embed("⚡ Exec", e));
    }
  }
}

module.exports = execCommand;
