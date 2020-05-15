const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class hugCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["huggle"],
      args: "<member:member>",
      description: "Gives a member a hug.",
      cooldown: 3,
    });
  }

  async run(msg, args, pargs) {
    // Sets weebsh auth & image type
    const body = await fetch("https://api.weeb.sh/images/random?type=hug", { headers: { "Authorization": `Wolke ${this.bot.key.weebsh}`, "User-Agent": `${this.bot.user.username}/${this.bot.version}` } })
      .then(async res => await res.json().catch(() => {}));
    let image;

    // Fallback image
    if (body.status !== 200) image = "https://cdn.weeb.sh/images/SJfEks3Rb.gif";
    else if (body.status === 200) image = body.url;

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        description: `💜 **${msg.author.username}** gave **${pargs[0].value.username}** a hug!`,
        color: this.bot.embed.color("general"),
        image: {
          url: image,
        },
        footer: {
          icon_url: this.bot.user.dynamicAvatarURL(),
          text: "Powered by weeb.sh",
        },
      },
    });
  }
}

module.exports = hugCommand;
