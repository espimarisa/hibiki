const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class hypnohubCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["hypno"],
      args: "[tags:string]",
      description: "Sends an image from Hypnohub.",
      nsfw: true,
      cooldown: 3,
    });
  }

  async run(msg, args) {
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

    const body = await fetch(`https://hypnohub.net/post.json?api_version=2&tags=${encodeURIComponent(args.join(" "))}`)
      .then(res => res.json().catch(() => {}));
    if (!body) return this.bot.embed("❌ Error", "No images were found.", msg, "error");
    const random = Math.floor(Math.random() * body.posts.length);

    msg.channel.createMessage({
      embed: {
        title: "🔞 Hypnohub",
        color: 0xFDEA73,
        image: {
          url: body.posts[random].sample_url,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = hypnohubCommand;
