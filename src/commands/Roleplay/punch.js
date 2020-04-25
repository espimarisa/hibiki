const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class punchCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<member:member&strict>",
      description: "Punches a member.",
      cooldown: 3,
    });
  }

  async run(msg, args, pargs) {
    // Sets weebsh auth & image type
    const res = await fetch("https://api.weeb.sh/images/random?type=punch", { headers: { Authorization: `Wolke ${this.bot.key.weebsh}` } });
    const body = await res.json();

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        description: `💢 **${msg.author.username}** punched **${pargs[0].value.username}**!`,
        color: this.bot.embed.colour("general"),
        image: {
          url: body.url,
        },
        footer: {
          icon_url: this.bot.user.dynamicAvatarURL(),
          text: "Powered by weeb.sh",
        },
      },
    });
  }
}

module.exports = punchCommand;
