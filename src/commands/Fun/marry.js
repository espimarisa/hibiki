const Command = require("../../lib/structures/Command");
const yn = require("../../lib/utils/Ask.js").YesNo;

class marryCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<member:member>",
      aliases: ["propose"],
      description: "Proposes to another member.",
    });
  }

  async run(msg, args, pargs) {
    let user = pargs[0].value;
    // Gets marriage states
    let state = await this.bot.db.table("marriages").getAll(msg.author.id, user.id, { index: "marriages" });

    // If author is married
    if (state.find(m => m.id === msg.author.id || m.marriedTo === msg.author.id)) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "You're already married.", "error"));
    }

    // If mentioned user is married
    if (state.find(m => m.id === user.id || m.marriedTo === user.id)) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `**${user.username}** is already married.`, "error"));
    }

    // Sends original message
    let marrymsg = await msg.channel.createMessage(this.bot.embed("💘 Marry", `**${user.username}**, do you wish to marry **${msg.author.username}**?`));
    // Waits for response
    const response = await yn(this.bot, { author: user, channel: msg.channel });
    if (response) {
      await this.bot.db.table("marriages").insert({ id: msg.author.id, spouse: user.id });
      marrymsg.edit(this.bot.embed("💘 Marry", `**${msg.author.username}** and **${user.username}** are now married. Congrats!`));
    } else {
      marrymsg.edit(this.bot.embed("💘 Marry", "Marriage cancelled. Better luck next time!", "error"));
    }
  }
}

module.exports = marryCommand;
