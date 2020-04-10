const Command = require("../../lib/structures/Command");

class blacklistCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Blacklists a user or server.",
      allowdisable: false,
      owner: true,
    });
  }

  async run(msg, args) {
    if (!args.length) return msg.channel.createMessage(this.bot.embed("❌ Error", "No user or server given.", "error"));
    // Checks for id
    if (isNaN(args[0])) {
      if (!args[1]) return;
      if (isNaN(args[1])) return;
      // Updates db
      await this.bot.db.table("blacklist").insert({ guild: args[1], });
      // Makes bot leave server
      this.bot.guilds.find(o => o.id == args[1]).leave();
      msg.channel.createMessage(this.bot.embed("✅ Success", `Blacklisted **${args[1]}**.`, "success"));
    } else {
      // Blacklists user
      await this.bot.db.table("blacklist").insert({ user: args[0], });
      msg.channel.createMessage(this.bot.embed("✅ Success", `Blacklisted **${args[0]}**.`, "success"));
    }
  }
}

module.exports = blacklistCommand;
