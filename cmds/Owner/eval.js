const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");
const { inspect } = require("util");

class evalCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Evaluates some JavaScript.",
      allowdisable: false,
      owner: true,
    });
  }

  async run(msg, args) {
    try {
      // Tries to eval
      const evaluated = await eval(`(async () => {\n${args.join(" ")}\n})()`);
      const evalstring = typeof evaluated === "string" ? evaluated : inspect(evaluated);
      console.log(evalstring);
      // Uploads if over embed limit; DMs author
      const dmchannel = await msg.author.getDMChannel();
      if (evalstring.length > 2000) {
        const body = await fetch("https://hasteb.in/documents", { referrer: "https://hasteb.in/", body: evalstring, method: "POST", mode: "cors" })
          .then(async res => await res.json().catch(() => {}));
        await dmchannel.createMessage(this.bot.embed("❌ Error", `Output longer than 2000. View the output [here](https://hasteb.in/${body.key}).`, "error"));
      } else {
        msg.channel.createMessage(this.bot.embed("✅ Success", `\`\`\`js\n${evalstring.replace(this.bot.cfg.token, "Bot token hidden.")}\n\`\`\``, "success"));
      }
    } catch (e) {
      // Sends if an error returned
      msg.channel.createMessage(this.bot.embed("❌ Error", `\`\`\`js\n${err.stack}\n\`\`\``, "error"));
    }
  }
}

module.exports = evalCommand;
