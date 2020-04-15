// todo: allow non-staff (not implemented yet..) users to check the prefix but not set it, like v2
const Command = require("../../lib/structures/Command");

class prefixCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<prefix:string>",
      descriptiom: "Views or changes the bot's prefix.",
      allowdisable: false,
    });
  }

  async run(msg, args) {
    msg.channel.createMessage(args[0]);
  }
}

module.exports = prefixCommand;
