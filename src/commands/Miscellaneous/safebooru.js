const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class safebooruCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["sb"],
      args: "[tags:string]",
      description: "Sends an image from Safebooru.",
      cooldown: 3,
    });
  }

  async run(msg, args) {
    const body = await fetch(`https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&tags=${encodeURIComponent(args.join(" "))}`)
      .then(res => res.json().catch(() => {}));

    if (!body || !body[0].image || !body[0].directory) {
      return this.bot.embed("❌ Error", "No images were found.", msg, "error");
    }

    if (body[0].image.endsWith(".webm") || body[0].image.endsWith(".mp4")) {
      return this.bot.embed("❌ Error", `Post is a video. You can view it [here](${body[0].image}).`, msg, "error");
    }

    const random = Math.floor(Math.random() * body.length);

    msg.channel.createMessage({
      embed: {
        title: "🖼 Safebooru",
        color: 0xBDE6E8,
        image: {
          url: `https://safebooru.org/images/${body[random].directory}/${body[random].image}`,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = safebooruCommand;
