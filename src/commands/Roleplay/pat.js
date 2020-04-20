const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class patCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["headpat, pet"],
      args: "<member:member>",
      description: "Gives a member a headpat.",
      cooldown: 3,
    });
  }

  async run(msg, args, pargs) {
    // Sets weebsh auth & image type
    const res = await fetch("https://api.weeb.sh/images/random?type=pat", { headers: { Authorization: `Wolke ${this.bot.key.weebsh}` } });
    const body = await res.json();

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        description: `♥ **${msg.author.username}** gave **${pargs[0].value.username}** a headpat!`,
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

module.exports = patCommand;
