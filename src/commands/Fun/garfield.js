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
    const today = new Date();

    function GarfieldRandom() {
      const start = new Date("1978/06/19").getTime();
      const date = new Date(start + Math.random() * (today.getTime() - start));

      function pad(n) { return n < 10 ? `0${n}` : n; }
      const archive = "https://d1ejxu6vysztl5.cloudfront.net/comics/garfield/";
      const url = `${archive + date.getFullYear()}/${date.getFullYear()}-${pad(date.getMonth())}-${pad(date.getDate())}.gif`;
      const garfield = [url, date.getFullYear(), pad(date.getMonth()), pad(date.getDate())];
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
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = garfieldCommand;
