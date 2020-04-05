const Command = require("../../lib/structures/Command");

class exampleCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: [""],
      args: "",
      clientperms: "",
      description: "",
      requiredperms: "",
      cooldown: 0,
      allowdisable: true,
      owner: false,
      staff: false,
    });
  }

  async run(msg) {
    msg.channel.createMessage(this.bot.embed("💬 Example", "This is an example command.", "general"))
  }
}

module.exports = exampleCommand;
