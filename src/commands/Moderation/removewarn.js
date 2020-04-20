const Command = require("../../lib/structures/Command");

class removewarnCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<id:string>",
      aliases: ["removepunish", "rmpunish", "removestrike", "removestrikes", "rmstrike", "rw", "rmwarn", "removewarning"],
      description: "Removes one or more warnings.",
      requiredPerms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args) {
    // todo: actually do this
  }
}

module.exports = removewarnCommand;
