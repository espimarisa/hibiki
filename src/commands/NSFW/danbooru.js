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
    // Danbooru only supports up to 2 tags at a time
    if (args.length > 2) return this.bot.embed("❌ Error", "You can only search for 2 tags at a time.", msg, "error");

    // Filters specific content
    const search = args.join("").toLowerCase();
    if (search.includes("hibiki") || search.includes("loli") || search.includes("shota")) {
      msg.channel.createMessage({
        embed: {
          title: "❌ Disgusting...",
          color: this.bot.embed.color("error"),
          image: {
            url: "https://i.imgur.com/evfz3WI.png",
          },
          footer: {
            text: `Ran by ${this.bot.tag(msg.author)}`,
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      });

      // Logs TOS breakers
      return this.bot.createMessage(this.bot.config.logchannel, {
        embed: {
          color: this.bot.embed.color("error"),
          author: {
            name: `${this.bot.tag(msg.author)} (${msg.author.id}) searched for ${search} on ${this.id}`,
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      });
    }

    const body = await fetch(`https://danbooru.donmai.us/posts.json?&tags=${encodeURIComponent(args.join(" "))}`)
      .then(res => res.json().catch(() => {}));

    // Sends if no posts
    if (!body || !body[0] || !body[0].file_url || !body.length) {
      return this.bot.embed("❌ Error", "No posts were found.", msg, "error");
    }

    // Gets random post
    const random = Math.floor(Math.random() * body.length);
    if (body && random && body[random].file_url.endsWith(".webm") || body[random].file_url.endsWith(".mp4")) {
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
