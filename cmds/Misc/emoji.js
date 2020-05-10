const Command = require("../../lib/structures/Command");

class emojiCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<emoji:string>",
      aliases: ["emote", "enlarge"],
      description: "Enlarges an emoji.",
    });
  }

  run(msg, args) {
    // Gets the emoji
    const emojiid = args.join("").split(/<:[a-zA-Z]{1,128}:([0-9]{17,18})>/).join("");
    if (!emojiid || isNaN(emojiid)) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "Either that's a default emoji or it wasn't found.", "error"));
    }

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: "😄 Enlarged Emoji",
        color: this.bot.embed.color("general"),
        image: {
          url: `https://cdn.discordapp.com/emojis/${emojiid}.png`,
        },
      },
    });
  }
}

module.exports = emojiCommand;
