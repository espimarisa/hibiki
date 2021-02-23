const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class factCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["catfact", "dogfact", "randomfact", "uselessfact"],
      args: "[type:string]",
      description: "Posts a cat, dog, or random fact.",
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg, args) {
    const apis = [
      "https://catfact.ninja/fact",
      "https://dog-api.kinduff.com/api/facts",
      "https://useless-facts.sameerkumar.website/api",
    ];

    // Fetches the facts
    const apinames = ["cat", "dog", "useless"];
    const apilabels = ["🐱 Cat Fact", "🐶 Dog Fact", "🍀 Useless Fact"];
    let index = Math.floor(Math.random() * apis.length);

    if (args.length > 0 && apinames.filter(api => api.includes(args.join(" "))).length) {
      index = apinames.indexOf(apinames.filter(api => api.includes(args.join(" ")))[0]);
    }

    const api = apis[index];
    const apiname = apinames[index];
    const apilabel = apilabels[index];
    let fact;

    // Sends the fact
    const body = await fetch(api).then(res => res.json().catch(() => {}));
    if (!body) return this.bot.embed.edit("❌ Error", "Couldn't send the fact. Try again later.", factmsg, "error");
    if (apiname === "cat") fact = body.fact;
    else if (apiname === "dog") fact = body.facts[0];
    else if (apiname === "useless") fact = body.data;
    this.bot.embed(apilabel, fact, msg);
  }
}

module.exports = factCommand;
