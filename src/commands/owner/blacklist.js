const Command = require("../../structures/Command");

class blacklistCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<type:string>",
      description: "Blacklists a member or server.",
      allowdisable: false,
      owner: true,
    });
  }

  async run(msg, args) {
    // Guild
    if (isNaN(args[0])) {
      if (!args[1]) return;
      if (isNaN(args[1])) return;
      await this.bot.db.table("blacklist").insert({ guild: args[1] }).run();
      this.bot.guilds.find(o => o.id === args[1]).leave().catch(() => {});
      this.bot.embed("✅ Success", `Blacklisted **${args[1]}**.`, msg, "success");
    } else {
      // User
      await this.bot.db.table("blacklist").insert({ user: args[0] }).run();
      this.bot.embed("✅ Success", `Blacklisted **${args[0]}**.`, msg, "success");
    }
  }
}

module.exports = blacklistCommand;
