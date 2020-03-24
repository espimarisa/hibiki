const Command = require("../../lib/Structures/Command");

class ping extends Command {
  constructor(...args) {
    super(...args);
  }

  run(msg) {
    msg.channel.createMessage("ping omg :o");
    this.bot.log("ping command OMG!");
  }
}

module.exports = ping;
