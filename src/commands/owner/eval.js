const { inspect } = require("util");
const Command = require("../../structures/Command");
const fetch = require("node-fetch");

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
      const evaluated = await eval(`(async () => {\n${args.join(" ")}\n})()`);
      const evalstring = typeof evaluated === "string" ? evaluated : inspect(evaluated);
      console.log(evalstring);

      // Uploads if over embed limit; DMs author
      const dmchannel = await msg.author.getDMChannel();
      if (evalstring.length > 2000) {
        const body = await fetch("https://hasteb.in/documents", {
          referrer: "https://hasteb.in/",
          body: evalstring,
          method: "POST",
          mode: "cors",
        }).then(res => res.json().catch(() => {}));

        await dmchannel.createMessage(`https://hasteb.in/${body.key}`);
      } else {
        this.bot.embed("✅ Success", `\`\`\`js\n${evalstring.replace(this.bot.config.token, "Bot token hidden.")}\n\`\`\``, msg, "success");
      }
    } catch (err) {
      this.bot.embed("❌ Error", `\`\`\`js\n${err.stack}\n\`\`\``, msg, "error");
    }
  }
}

module.exports = evalCommand;
