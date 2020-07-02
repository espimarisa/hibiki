const Command = require("../../structures/Command");
const yn = require("../../utils/ask").yesNo;

class divorceCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Ends your marriage.",
    });
  }

  async run(msg) {
    // Gets marriage states
    const [state] = await this.bot.db.table("marriages").getAll(msg.author.id, { index: "marriages" }).run();
    if (!state) return this.bot.embed("❌ Error", "You aren't married to anyone.", msg, "error");

    // Waits for response
    const divorcemsg = await this.bot.embed("💔 Divorce ", "Are you sure you want to divorce your spouse?", msg);
    const response = await yn(this.bot, { author: msg.author, channel: msg.channel });
    if (!response) return this.bot.embed.edit("💔 Divorce", "Cancelled the divorce.", divorcemsg);

    // Divorces the users
    await this.bot.db.table("marriages").get(state.id).delete().run();
    this.bot.embed.edit("💔 Divorce", "You're no longer married.", divorcemsg);
  }
}

module.exports = divorceCommand;
