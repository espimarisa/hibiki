const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class remCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Sends a random picture of Rem from Re:Zero.",
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://api.weeb.sh/images/random?type=rem", {
      headers: {
        "Authorization": `Wolke ${this.bot.key.weebsh}`,
        "User-Agent": `${this.bot.user.username}/${this.bot.version}`,
      },
    }).then(res => res.json().catch(() => {}));

    let image;
    if (body.status !== 200) image = "https://cdn.weeb.sh/images/SJOS-1YvW.jpeg";
    else if (body.status === 200) image = body.url;

    msg.channel.createMessage({
      embed: {
        title: "🌸 Rem",
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

module.exports = remCommand;
