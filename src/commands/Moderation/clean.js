const Command = require("../../lib/structures/Command");

class agreeCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Deletes the last 10 messages from the bot.",
      clientperms: "manageMessages",
      requiredperms: "manageMessages",
      cooldown: 2,
      staff: true,
    });
  }

  async run(msg) {
    // Gets the messages
    let msgs = await msg.channel.getMessages(100);
    msgs = msgs.filter(m => m.author.id === this.bot.user.id);
    msgs = msgs.map(m => m.id);
    msgs.splice(msgs.length - 10, msgs.length);
    // Deletes the messages
    await msg.channel.deleteMessages(msgs).catch(() => {});
    const cleanmsg = await msg.channel.createMessage(this.bot.embed("💣 Clean", "Deleted the **last 10** messages from me."));
    // Deletes success message
    await setTimeout(() => { cleanmsg.delete().catch(() => {}); }, 2000);
  }
}

module.exports = agreeCommand;
