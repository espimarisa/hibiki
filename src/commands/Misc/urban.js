const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class urbanCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["urbandic", "urbandictionary"],
      args: "<string:word>",
      description: "Returns a definition from the Urban Dictionary.",
      cooldown: 3,
    });
  }

  async run(msg, args, pargs) {

  }
}

module.exports = urbanCommand;
