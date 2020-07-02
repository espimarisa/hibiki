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
    // Gets the day's comic
    const comic = args.join("");
    if (comic === "today" || comic === "daily") {
      const body = await fetch("https://xkcd.com/info.0.json").then(async res => res.json());
      if (!body || !body.num) return this.bot.embed("❌ Error", "Couldn't send the comic. Try again later.", msg, "error");

      return msg.channel.createMessage({
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

    // Gets specified comic
    if (args.length) {
      const body = await fetch(`https://xkcd.com/${comic}/info.0.json`).then(async res => await res.json().catch(() => {}));
      if (!body || !body.num) return this.bot.embed("❌ Error", "Comic not found.", msg, "error");

      return msg.channel.createMessage({
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

    // Random comic
    let body = await fetch("https://xkcd.com/info.0.json").then(async res => res.json());
    if (!body || !body.num) return this.bot.embed("❌ Error", "Couldn't send the comic. Try again later.", msg, "error");
    const random = Math.floor(Math.random() * body.num) + 1;
    body = await fetch(`https://xkcd.com/${random}/info.0.json`).then(async res => res.json());

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
