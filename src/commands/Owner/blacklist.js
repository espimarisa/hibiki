const Command = require("structures/Command");

class blacklistCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<id:string>",
      description: "Blacklists a member or server.",
      allowdisable: false,
      owner: true,
    });
  }

  async run(msg, args) {
    if (isNaN(args[0])) {
      if (!args[1]) return;
      if (isNaN(args[1])) return;
      await this.bot.db.table("blacklist").insert({ guild: args[1] }).run();
      this.bot.guilds.find(o => o.id === args[1]).leave();
      this.bot.embed("✅ Success", `Blacklisted **${args[1]}**.`, msg, "success");
    } else {
      await this.bot.db.table("blacklist").insert({ user: args[0] }).run();
      this.bot.embed("✅ Success", `Blacklisted **${args[0]}**.`, msg, "success");
    }
  }
}

module.exports = blacklistCommand;
