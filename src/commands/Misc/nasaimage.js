const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class nasaimageCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["nasa", "nasaimg", "space", "spaceimage", "spaceimg", "spacephoto"],
      args: "<query:string>",
      description: "Sends an image from NASAs archive.",
      cooldown: 3,
    });
  }

  async run(msg, args) {
    // Fetches the API
    const nasamsg = await msg.channel.createMessage(this.bot.embed("☄ NASA Image", "Searching NASA's archive..."));
    const body = await fetch(`https://images-api.nasa.gov/search?media_type=image&q=${encodeURIComponent(args.join(" "))}`)
      .then(async res => await res.json().catch(() => {}));
    const images = body.collection.items;
    const data = images[Math.floor(Math.random() * images.length)];
    if (!data) return nasamsg.edit(this.bot.embed("❌ Error", "No images found.", "error"));

    // Edits the message
    nasamsg.edit({
      embed: {
        title: "☄ Nasa Image",
        description: data.data[0].description.length > 2000 ? `${data.data[0].description.substring(0, 2000)}...` : data.data[0].description,
        color: this.bot.embed.color("general"),
        image: {
          url: data.links[0].href,
        },
      },
    });
  }
}

module.exports = nasaimageCommand;
