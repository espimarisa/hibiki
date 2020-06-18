const Command = require("structures/Command");
const fetch = require("node-fetch");
const { inspect } = require("util");

class stealembedCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Grabs an embed object from a message.",
    });
  }

  async run(msg, args) {
    // Looks for the message
    const m = await msg.channel.getMessage(args.join("")).catch(() => {});
    if (!m) return msg.channel.createMessage(this.bot.embed("❌ Error", "Message not found."));
    // Gets the richembed
    const richembed = m.embeds.find(e => e.type === "rich");
    if (!richembed) return msg.channel.createMessage(this.bot.embed("❌ Error", "There's not an embed in that message.", "error"));
    if (richembed.type) delete richembed.type;
    const body = await fetch("https://hasteb.in/documents", { referrer: "https://hasteb.in/", body: inspect(richembed), method: "POST", mode: "cors" })
      .then(async res => await res.json().catch(() => {}));
    this.bot.embed("🔗 Steal Embed", `The embed object can be viewed [here](https://hasteb.in/${body.key}.js).`, msg);
  }
}

module.exports = stealembedCommand;
