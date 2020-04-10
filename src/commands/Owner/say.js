const Command = require("../../lib/structures/Command");

class sayCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Makes the bot say something.",
      allowdisable: false,
      owner: true,
    });
  }

  async run(msg, args) {
    if (!args.length) return msg.channel.createMessage(this.bot.embed("❌ Error", "No text given.", "error"));
    // Sends message
    msg.channel.createMessage(args.join(" "));
    // Deletes author's message
    await msg.delete();
  }
}

module.exports = sayCommand;
