const Command = require("../../lib/structures/Command");

class whitelistCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<item:string>",
      description: "Removes a user or server from the blacklist.",
      allowdisable: false,
      owner: true,
    });
  }

  async run(msg, args) {
    // Checks for id
    if (isNaN(args[0])) {
      if (!args[1]) return;
      if (isNaN(args[1])) return;
      // Updates db
      await this.bot.db.table("blacklist").filter({ guild: args[1] }).delete();
      // Makes bot leave server
      this.bot.guilds.find(o => o.id === args[1]).leave();
      msg.channel.createMessage(this.bot.embed("✅ Success", `Whitelisted **${args[1]}**.`, "success"));
    } else {
      // Blacklists user
      await this.bot.db.table("blacklist").filter({ user: args[0] }).delete();
      msg.channel.createMessage(this.bot.embed("✅ Success", `Whitelisted **${args[0]}**.`, "success"));
    }
  }
}

module.exports = whitelistCommand;
