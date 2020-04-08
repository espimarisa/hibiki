// user&fallback = fallback to author
const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class patCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["headpat, pet"],
      args: "<user:user>",
      description: "Pats another user.",
      cooldown: 3,
    });
  }

  async run(msg, args, pargs) {
    // Sets weebsh auth & image type
    let res = await fetch(`https://staging.weeb.sh/images/random?type=pat`, { headers: { Authorization: `Wolke ${this.bot.key.weebsh}` } });
    let body = await res.json();

    console.log(args)
    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: "♥ Pat",
        // description: `**${msg.author.username}** gave **${pargs[0].value.user.username}** a headpat!`,
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

module.exports = patCommand;
