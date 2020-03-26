const Command = require("../../lib/structures/Command");

// todo: allow non-staff (not implemented yet..) users to check the prefix but not set it, like v2
class prefixcmd extends Command {
  constructor(...args) {
    super(...args, {
      args: "<prefix:string>",
      descriptiom: "Views or changes the bot's prefix.",
      allowdisable: false,
      staff: true
    });
  }

  async run(msg, pargs) {
    msg.channel.createMessage(pargs[0].value);
  }
}

module.exports = prefixcmd;
