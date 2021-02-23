const Command = require("../../structures/Command");
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
    const body = await fetch("https://api.weeb.sh/images/random?type=pat", {
      headers: {
        "Authorization": `Wolke ${this.bot.key.weebsh}`,
        "User-Agent": `${this.bot.user.username}/${this.bot.version}`,
      },
    }).then(res => res.json().catch(() => {}));

    let image;
    if (body.status !== 200) image = "https://cdn.weeb.sh/images/SJmW1RKtb.gif";
    else if (body.status === 200) image = body.url;

    msg.channel.createMessage({
      embed: {
        description: `♥ **${msg.author.username}** gave **${pargs[0].value.username}** a headpat!`,
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

module.exports = patCommand;
