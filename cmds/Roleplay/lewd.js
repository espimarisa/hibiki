const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class lewdCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<user:user&fallback>",
      description: "Tells a member they're being too lewd.",
      cooldown: 3,
    });
  }

  async run(msg, args, pargs) {
    // Sets weebsh auth & image type
    let res = await fetch(`https://api.weeb.sh/images/random?type=lewd`, { headers: { Authorization: `Wolke ${this.bot.key.weebsh}` } });
    let body = await res.json();

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        description: `🔞 **${pargs[0].value.username}** is being too lewd!`,
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

module.exports = lewdCommand;
