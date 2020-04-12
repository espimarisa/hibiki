// todo: filter token from this.bot.cfg whenever evaluated
const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");
const { inspect } = require("util");

class evalCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<script:string>",
      description: "Evaluates some JavaScript.",
      allowdisable: false,
      owner: true,
    });
  }

  async run(msg, args) {
    try {
      // Tries to eval
      const evaluated = await eval(`(async () => {\n${args.join(" ")}\n})()`);
      const evalstring = typeof evaluated == "string" ? evaluated : inspect(evaluated);
      console.log(evalstring);
      // Uploads if over embed limit
      if (evalstring.length > 2000) {
        const res = await fetch("https://hasteb.in/documents", { referrer: "https://hasteb.in/", body: evalstring, method: "POST", mode: "cors" });
        const { key } = await res.json();
        msg.channel.createMessage(this.bot.embed("❌ Error", `Output longer than 2000. View the output [here](https://hasteb.in/${key}).`, "error"));
      } else {
        msg.channel.createMessage(this.bot.embed("✅ Success", `\`\`\`js\n${evalstring.replace(this.bot.token, "This would have displayed a key or token. Check the console.")}\n\`\`\``, "success"));
      }
    } catch (err) {
      // Sends if an error returned
      msg.channel.createMessage(this.bot.embed("❌ Error", `\`\`\`js\n${err.stack}\n\`\`\``, "error"));
    }
  }
}

module.exports = evalCommand;
