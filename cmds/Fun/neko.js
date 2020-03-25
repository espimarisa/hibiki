const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class nekocmd extends Command {
  constructor(...args) {
    super(...args);
  }

  async run(msg) {
    // Fetches the API
    // we should use weeb.sh ... but I don't feel like messing with their dumbs API tonight
    let res = await fetch("https://nekos.life/api/neko");
    let body = await res.json();

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: "🐾 Meow!",
        image: {
          url: body.neko,
        },
        // todo: this.bot.colour.whatever
        color: require("../../lib/scripts/Colour")("general"),
      }
    });
  }
}

module.exports = nekocmd;
