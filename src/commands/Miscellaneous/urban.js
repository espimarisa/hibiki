const Command = require("../../structures/Command");
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
    const query = args.join(" ");
    const body = await fetch(`http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`)
      .then(res => res.json().catch(() => { }));

    // If the API fails to return info
    if (!body) return this.bot.embed("❌ Error", "Couldn't send the definition. Try again later.", msg, "error");

    // Sorts by highest rated definition
    const topword = body.list.sort((a, b) => b.thumbs_up - a.thumbs_up);
    const word = topword[0];
    if (!topword || !word || !word.definition) return this.bot.embed("❌ Error", "No definition found.", msg, "error");

    // Cleans up definitions & examples
    word.definition = topword[0].definition.replace(/[[\]]/g, "");
    word.example = topword[0].example.replace(/[[\]]/g, "");
    if (word.definition.length > 1024) {
      const fullstop = word.definition.slice(0, 1024).lastIndexOf(".");
      word.definition = word.definition.slice(0, fullstop + 1);
    }

    const fields = [];
    if (word.example) fields.push({ name: "Example", value: `${word.example}` });
    if (word.thumbs_up) fields.push({ name: "Upvotes", value: word.thumbs_up, inline: true });
    if (word.thumbs_down) fields.push({ name: "Downvotes", value: word.thumbs_down, inline: true });

    msg.channel.createMessage({
      embed: {
        title: `📔 ${word.word}`,
        description: word.definition,
        color: this.bot.embed.color("general"),
        fields: fields,
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = urbanCommand;
