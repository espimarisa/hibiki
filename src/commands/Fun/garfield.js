const Command = require("structures/Command");

class garfieldCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Sends a random Garfield comic.",
      allowdms: true,
      cooldown: 3,
    });
  }

  run(msg) {
    // Gets a random comic
    function GarfieldRandom() {
      const days = 24 * 60 * 60 * 1000;
      const today = new Date();
      const start = new Date("1978/06/19");
      const date = new Date(start.getTime() + Math.random() * (today.getTime() - start));

      // Gets total amount of comics
      const total = Math.round(Math.abs((start.getTime() - today.getTime()) / (days)));

      // Gets image URL
      function pad(n) { return n < 10 ? `0${n}` : n; }
      const archive = "https://d1ejxu6vysztl5.cloudfront.net/comics/garfield/";
      const url = `${archive + date.getFullYear()}/${date.getFullYear()}-${pad(date.getMonth())}-${pad(date.getDate())}.gif`;
      const garfield = [url, date.getFullYear(), pad(date.getMonth()), pad(date.getDate()), total];
      return garfield;
    }

    const garfield = GarfieldRandom();
    if (!garfield[0]) return this.bot.embed("❌ Error", "Couldn't send the comic. Try again later.", msg, "error");

    msg.channel.createMessage({
      embed: {
        title: `💭 Published on ${garfield[1]}-${garfield[2]}-${garfield[3]}`,
        color: this.bot.embed.color("general"),
        image: {
          url: garfield[0],
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)} | ${garfield[4]} total comics`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = garfieldCommand;
