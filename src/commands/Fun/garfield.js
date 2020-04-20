const Command = require("../../lib/structures/Command");

class garfieldCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["garf"],
      description: "Sends a random Garfield comic.",
      cooldown: 3,
    });
  }

  run(msg) {
    let today = new Date();
    // Random comic function
    function GarfieldRandom() {
      let start = new Date("1978/06/19").getTime();
      let date = new Date(start + Math.random() * (today.getTime() - start));
      // Comic URLs
      function pad(n) { return n < 10 ? `0${n}` : n; }
      let archive = "https://d1ejxu6vysztl5.cloudfront.net/comics/garfield/";
      let url = `${archive + date.getFullYear()}/${date.getFullYear()}-${pad(date.getMonth())}-${pad(date.getDate())}.gif`;
      let garfield = [url, date.getFullYear(), pad(date.getMonth()), pad(date.getDate())];
      return garfield;
    }

    // Gets random comic
    const garfield = GarfieldRandom();
    if (!garfield[0]) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't send the comic. Try again later.", "error"));

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: `💭 Published on ${garfield[1]}-${garfield[2]}-${garfield[3]}`,
        image: {
          url: garfield[0],
        },
        color: this.bot.embed.colour("general"),
      },
    });
  }
}

module.exports = garfieldCommand;
