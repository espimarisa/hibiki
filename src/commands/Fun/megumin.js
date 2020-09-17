const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class meguminCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["megu"],
      description: "Sends a random gif of Megumin.",
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://api.weeb.sh/images/random?type=megumin", {
      headers: {
        "Authorization": `Wolke ${this.bot.key.weebsh}`,
        "User-Agent": `${this.bot.user.username}/${this.bot.version}`,
      },
    }).then(res => res.json().catch(() => {}));

    let image;
    if (body.status !== 200) image = "https://cdn.weeb.sh/images/ry8LxA_wZ.gif";
    else if (body.status === 200) image = body.url;

    msg.channel.createMessage({
      embed: {
        title: "💥 Megumin!",
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

module.exports = meguminCommand;
