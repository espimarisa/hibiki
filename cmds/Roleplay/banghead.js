const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class bangheadCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Bangs your head on something.",
      cooldown: 3,
    });
  }

  async run(msg) {
    // Sets weebsh auth & image type
    let res = await fetch(`https://api.weeb.sh/images/random?type=banghead`, { headers: { Authorization: `Wolke ${this.bot.key.weebsh}` } });
    let body = await res.json();

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        description: `💢 **${msg.author.username}** is banging their head!`,
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

module.exports = bangheadCommand;
