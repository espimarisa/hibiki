const { inspect } = require("util");

const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class stealembedCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Sends the richembed data from a message.",
    });
  }

  async run(msg, args) {
    // Looks for the message
    const message = await msg.channel.getMessage(args.join("")).catch(() => {});
    if (!message) return this.bot.embed("❌ Error", "Message not found.", msg, "error");

    // Gets the richembed
    const richembed = message.embeds.find(e => e.type === "rich");
    if (!richembed) return this.bot.embed("❌ Error", "There's not an embed in that message.", msg, "error");
    if (richembed.type) delete richembed.type;

    const body = await fetch("https://hasteb.in/documents", {
      referrer: "https://hasteb.in/",
      body: inspect(richembed),
      method: "POST",
      mode: "cors",
    }).then(res => res.json().catch(() => {}));

    if (!body || !body.key) return this.bot.embed("❌ Error", "Failed to upload the embed info. Try again later.", msg, "error");
    this.bot.embed("🔗 Embed Object", `You can view the embed object [here](https://hasteb.in/${body.key}.js).`, msg);
  }
}

module.exports = stealembedCommand;
