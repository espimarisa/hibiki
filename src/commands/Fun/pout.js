const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class poutCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["hmph"],
      args: "<user:user>",
      description: "Pouts at another member.",
      cooldown: 3,
    });
  }

  async run(msg, args, pargs) {
    // Sets weebsh auth & image type
    let res = await fetch(`https://api.weeb.sh/images/random?type=pout`, { headers: { Authorization: `Wolke ${this.bot.key.weebsh}` } });
    let body = await res.json();

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        description: `💢 **${msg.author.username}** is pouting at **${pargs[0].value.username}**!`,
        color: this.bot.embed.colour("general"),
        image: {
          url: body.url,
        },
        footer: {
          icon_url: this.bot.user.dynamicAvatarURL("png"),
          text: "Powered by weeb.sh",
        }
      }
    });
  }
}

module.exports = poutCommand;
