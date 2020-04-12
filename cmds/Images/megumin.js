const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class meguminCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["megu"],
      description: "Sends a picture of Megumin.",
      cooldown: 3,
    });
  }

  async run(msg) {
    // Sets weebsh auth & image type
    let res = await fetch("https://api.weeb.sh/images/random?type=megumin", { headers: { Authorization: `Wolke ${this.bot.key.weebsh}` } });
    let body = await res.json();

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: "🔥 Megumin",
        color: this.bot.embed.colour("general"),
        image: {
          url: body.url,
        },
        footer: {
          icon_url: this.bot.user.dynamicAvatarURL(),
          text: "Powered by weeb.sh",
        }
      }
    });
  }
}

module.exports = meguminCommand;
