const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class blushCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["blushing"],
      description: "Posts a picture of you blushing.",
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://api.weeb.sh/images/random?type=blush", {
      headers: {
        "Authorization": `Wolke ${this.bot.key.weebsh}`,
        "User-Agent": `${this.bot.user.username}/${this.bot.version}`,
      },
    }).then(res => res.json().catch(() => {}));

    let image;
    if (body.status !== 200) image = "https://cdn.weeb.sh/images/rJa-zUmv-.gif";
    else if (body.status === 200) image = body.url;

    msg.channel.createMessage({
      embed: {
        description: `🧡 **${msg.author.username}** is blushing, how cute!`,
        color: this.bot.embed.color("general"),
        image: {
          url: image,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)} | Powered by weeb.sh`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = blushCommand;
