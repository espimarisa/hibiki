const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class remCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["megu"],
      description: "Sends a picture of Rem from Re:Zero.",
      cooldown: 3,
    });
  }

  async run(msg) {
    // Sets weebsh auth & image type
    let res = await fetch(`https://api.weeb.sh/images/random?type=rem`, { headers: { Authorization: `Wolke ${this.bot.key.weebsh}` } });
    let body = await res.json();

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: "🌺 Rem",
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

module.exports = remCommand;
