const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class xkcdCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Sends a random comic from XKCD.",
      cooldown: 3,
    });
  }

  async run(msg) {
    // Fetches the info file
    let res = await fetch("http://xkcd.com/info.0.json");
    const newest = await res.json();
    // Sends if no comic
    if (!newest) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the comic. Try again later.", "error"));
    // Gets a random comic
    const random = Math.floor(Math.random() * newest.num) + 1;
    res = await fetch(`https://xkcd.com/${random}/info.0.json`);
    const body = await res.json();

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: `💭 ${body.safe_title}`,
        description: `${body.alt}`,
        color: this.bot.embed.color("general"),
        image: {
          url: body.img,
        },
        footer: {
          icon_url: this.bot.user.dynamicAvatarURL(),
          text: `Published on ${body.day <= 10 ? `0${body.day}` : body.day}/${body.month <= 10 ? `0${body.month}` : body.day}/${body.year}`,
        },
      },
    });
  }
}

module.exports = xkcdCommand;
