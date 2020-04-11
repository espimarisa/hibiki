const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class spaceimageCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["nasaimage", "nasaimg", "spacephoto"],
      description: "Shows a random image of space.",
      cooldown: 3,
    });
  }

  async run(msg, args) {
    // Sends a wait message
    let message = await msg.channel.createMessage(this.bot.embed("☄ Space Image", "Please wait, searching NASA's archive...", "general"));
    // Fetches the API
    let res = await fetch(`https://images-api.nasa.gov/search?media_type=image&q=${encodeURIComponent(args.join(" "))}`);
    let body = await res.json().catch(() => {});
    // Sets the images collection
    const images = body.collection.items;
    const data = images[Math.floor(Math.random() * images.length)];

    // Sends the embed
    if (data) {
      message.edit({
        embed: {
          title: "☄ Space Image",
          description: data.data[0].description.length > 2000 ? `${data.data[0].description.substring(0, 2000)}...` : data.data[0].description,
          color: this.bot.embed.colour("general"),
          image: {
            url: data.links[0].href,
          },
        },
      });
    } else return msg.channel.createMessage(this.bot.embed("❌ Error", "Nothing was found.", "error"));
  }
}

module.exports = spaceimageCommand;
