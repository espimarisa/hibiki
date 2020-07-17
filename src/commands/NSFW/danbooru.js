const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class danbooruCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["db", "donmai"],
      args: "[tags:string]",
      description: "Sends an image from Danbooru.",
      nsfw: true,
      cooldown: 3,
    });
  }

  async run(msg, args) {
    if (args.length > 2) return this.bot.embed("❌ Error", "You can only search for 2 tags at a time.", msg, "error");
    const body = await fetch(`https://danbooru.donmai.us/posts.json?&tags=${encodeURIComponent(args.join(" "))}`)
      .then(res => res.json().catch(() => {}));

    if (!body || !body[0] || !body[0].file_url || !body.length) {
      return this.bot.embed("❌ Error", "No posts were found.", msg, "error");
    }

    const random = Math.floor(Math.random() * body.length);

    if (body[random].file_url.endsWith(".webm") || body[random].file_url.endsWith(".mp4")) {
      return this.bot.embed("❌ Error", `Post is a video. You can view it [here](${body[0].file_url}).`, msg, "error");
    }

    msg.channel.createMessage({
      embed: {
        title: "🔞 Danbooru",
        color: 0x006FFA,
        image: {
          url: body[random].file_url,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = danbooruCommand;
