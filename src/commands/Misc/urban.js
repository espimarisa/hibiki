const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class urbanCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["urbandic", "urbandictionary"],
      args: "<word:string>",
      description: "Returns a definition from the Urban Dictionary.",
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg, args) {
    // Fetches the API
    const query = args.join("  ");
    const body = await fetch(`http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`).then(async res => await res.json().catch(() => {}));
    if (!body) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the definition. Try again later.", "error"));
    // Sorts by highest rated definition
    const topword = body.list.sort((a, b) => b.thumbs_up - a.thumbs_up);
    const word = topword[0];
    if (!topword || !word || !word.definition) return msg.channel.createMessage(this.bot.embed("❌ Error", "No definition found.", "error"));
    // Cleans up definitions & examples
    word.definition = topword[0].definition.replace(/[[\]]/g, "");
    word.example = topword[0].example.replace(/[[\]]/g, "");
    if (word.definition.length > 1024) word.definition.slice(1024);

    // Sets the fields
    const fields = [];
    if (word.example) fields.push({ name: "Example", value: `${word.example}` });
    if (word.thumbs_up) fields.push({ name: "Upvotes", value: word.thumbs_up, inline: true });
    if (word.thumbs_down) fields.push({ name: "Downvotes", value: word.thumbs_down, inline: true });

    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: `📔 ${query}`,
        description: word.definition,
        color: this.bot.embed.color("general"),
        fields: fields,
      },
    });
  }
}

module.exports = urbanCommand;
