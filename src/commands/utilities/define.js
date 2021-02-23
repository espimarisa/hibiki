const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class defineCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["defineword", "dict", "dictionary"],
      args: "<word:string>",
      description: "Gives a definition from the Merriam-Webster dictionary.",
      requiredkeys: ["dictionary"],
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg, args) {
    const body = await fetch(
      `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(args.join(" "))}?key=${this.bot.key.dictionary}`,
    ).then(res => res.json().catch(() => {}));
    if (!body || !body[0] || !body[0].meta) return this.bot.embed("❌ Error", "No definition found.", msg, "error");

    msg.channel.createMessage({
      embed: {
        title: `📕 Definition for ${args.join(" ")}`,
        color: this.bot.embed.color("general"),
        fields: [{
          name: "Category",
          value: `${body[0].fl || "No category"}`,
          inline: true,
        }, {
          name: "Stems",
          value: `${body[0].meta !== undefined || body[0].meta.stems ? body[0].meta.stems.join(", ") : "None"}`,
          inline: true,
        }, {
          name: "Definition",
          value: `${body[0].shortdef[0] || "No definition"}`,
          inline: false,
        }],
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = defineCommand;
