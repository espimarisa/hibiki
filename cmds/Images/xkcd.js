const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class xkcdCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Posts a random comic from XKCD.",
      cooldown: 3,
    });
  }

  async run(msg) {
    // Fetches the info file
    let res = await fetch("http://xkcd.com/info.0.json");
    let newest = await res.json();
    // Sends if no comic
    if (!newest) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the comic. Try again later.", "error"));
    // Gets a random comic
    let random = Math.floor(Math.random() * newest.num) + 1;
    res = await fetch(`https://xkcd.com/${random}/info.0.json`);
    let comic = await res.json();

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: `💭 ${comic.safe_title}`,
        description: `${comic.alt}`,
        color: this.bot.embed.colour("general"),
        image: {
          url: comic.img,
        },
        footer: {
          icon_url: this.bot.user.dynamicAvatarURL(),
          text: `Published on ${comic.day <= 10 ? `0${comic.day}` : comic.day}/${comic.month <= 10 ? `0${comic.month}` : comic.day}/${comic.year}`,
        },
      },
    });
  }
}

module.exports = xkcdCommand;
