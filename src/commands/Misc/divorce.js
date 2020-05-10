const Command = require("../../lib/structures/Command");
const yn = require("../../lib/utils/Ask.js").YesNo;

class divorceCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Ends your marriage.",
    });
  }

  async run(msg) {
    // Gets marriage states
    const [state] = await this.bot.db.table("marriages").getAll(msg.author.id, { index: "marriages" });
    // If author isn't married
    if (!state) return msg.channel.createMessage(this.bot.embed("❌ Error", "You aren't married to anyone.", "error"));
    // Waits for response
    const divorcemsg = await msg.channel.createMessage(this.bot.embed("💔 Divorce ", "Are you sure you want to divorce your spouse?"));
    const response = await yn(this.bot, { author: msg.author, channel: msg.channel });
    if (!response) return divorcemsg.edit(this.bot.embed("💔 Divorce", "Cancelled the divorce."));
    // Divorces the users
    await this.bot.db.table("marriages").get(state.id).delete();
    divorcemsg.edit(this.bot.embed("💔 Divorce", "You're no longer married."));
  }
}

module.exports = divorceCommand;
