const Command = require("../../lib/structures/Command");

class sayCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<text:string>",
      description: "Makes the bot say something.",
      allowdisable: false,
      owner: true,
    });
  }

  async run(msg, args) {
    // Sends message
    msg.channel.createMessage(args.join(" "));
    // Deletes author's message
    await msg.delete();
  }
}

module.exports = sayCommand;
