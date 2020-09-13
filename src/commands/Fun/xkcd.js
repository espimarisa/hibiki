const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class xkcdCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[id:string]",
      description: "Sends a comic from XKCD.",
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg, args) {
    const comic = args.join("");
    let api;

    // Daily comic
    if (comic === "today" || comic === "daily") api = "https://xkcd.com/info.0.json";

    // Specified comic
    else if (args.length) api = `https://xkcd.com/${comic}/info.0.json`;

    // Random comic
    else {
      const body = await fetch("https://xkcd.com/info.0.json").then(res => res.json());
      const random = Math.floor(Math.random() * body.num) + 1;
      api = `https://xkcd.com/${random}/info.0.json`;
    }

    const body = await fetch(api).then(res => res.json().catch(() => {}));
    if (!body || !body.num) return this.bot.embed("❌ Error", "Comic not found.", msg, "error");

    msg.channel.createMessage({
      embed: {
        title: `💬 ${body.safe_title}`,
        description: `${body.alt}`,
        color: this.bot.embed.color("general"),
        image: {
          url: body.img,
        },
        footer: {
          icon_url: msg.author.dynamicAvatarURL(),
          text: `Ran by ${this.bot.tag(msg.author)} | Published on ${body.day}/${body.month}/${body.year}`,
        },
      },
    });
  }
}

module.exports = xkcdCommand;
