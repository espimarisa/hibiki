const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class holdhandsCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["handhold"],
      args: "<member:member>",
      description: "Holds hands with another member.",
      cooldown: 3,
    });
  }

  async run(msg, args, pargs) {
    // Sets weebsh auth & image type
    let res = await fetch("https://api.weeb.sh/images/random?type=handholding", { headers: { Authorization: `Wolke ${this.bot.key.weebsh}` } });
    let body = await res.json();

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        description: `👀 **${msg.author.username}** is holding hands with **${pargs[0].value.username}**!`,
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

module.exports = holdhandsCommand;
