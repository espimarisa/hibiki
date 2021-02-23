const Command = require("../../structures/Command");

class whitelistCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<type:string>",
      description: "Removes a member or server from the blacklist.",
      allowdisable: false,
      owner: true,
    });
  }

  async run(msg, args) {
    // Guild
    if (isNaN(args[0])) {
      if (!args[1]) return;
      if (isNaN(args[1])) return;
      await this.bot.db.table("blacklist").filter({ guild: args[1] }).delete().run();
      this.bot.embed("✅ Success", `Whitelisted **${args[1]}**.`, msg, "success");
    } else {
      // User
      await this.bot.db.table("blacklist").filter({ user: args[0] }).delete().run();
      this.bot.embed("✅ Success", `Whitelisted **${args[0]}**.`, msg, "success");
    }
  }
}

module.exports = whitelistCommand;
