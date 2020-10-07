const Command = require("../../structures/Command");
const yn = require("../../utils/ask").yesNo;

class purgeCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["clear", "delete", "nuke", "p"],
      args: "<amount:string> [member:member&strict]",
      description: "Mass deletes a certain amount of messages.",
      requiredperms: "manageMessages",
      staff: true,
      cooldown: 3,
    });
  }

  async run(msg, args, pargs) {
    let author;
    const amount = args[0];
    pargs[1] && pargs[1].value ? author = pargs[1].value.user.id : author = null;

    // Checks purge amount and member to purge
    if (isNaN(amount)) return this.bot.embed("❌ Error", "No **valid amount** was provided.", msg, "error");
    if (amount <= 0) return this.bot.embed("❌ Error", "You can't purge less than one message.", msg, "error");
    if (amount > 100) return this.bot.embed("❌ Error", "You can only purge up to 100 messages at a time.", msg, "error");

    // Waits for a response
    const purgemsg = await this.bot.embed("💣 Purge", `Are you sure you want to purge **${amount}** messages?`, msg);
    const resp = await yn(this.bot, { author: msg.author, channel: msg.channel }, true);
    if (!resp) return this.bot.embed.edit("💣 Purge", "Purging cancelled.", purgemsg);

    // Gets the messages to purge
    if (resp && resp.response === true) {
      if (resp.msg) resp.msg.delete().catch(() => {});
      // Add 2 to account for response & the message that ran the command
      const messages = await msg.channel.getMessages(parseInt(amount) + 2);
      const toPurge = await messages.filter(m => {
        if (author && m.author.id !== author) return false;
        if (author && m.author.id === author) return true;
        return true;
      }).map(m => m.id);

      // Deletes the messages
      this.bot.deleteMessages(msg.channel.id, toPurge, `Purged by ${this.bot.tag(msg.author, true)}`).catch(() => {});

      // TODO: add amnt that failed
      const finalmsg = await this.bot.embed("💣 Purge", `**${amount}** messages were purged by **${msg.author.username}**.`, msg);
      setTimeout(() => { finalmsg.delete().catch(() => {}); }, 4000);
    } else return this.bot.embed.edit("💣 Purge", "Purging cancelled.", purgemsg);
  }
}

module.exports = purgeCommand;
