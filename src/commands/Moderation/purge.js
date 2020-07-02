const Command = require("../../structures/Command");
const yn = require("../../utils/ask").yesNo;

class purgeCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["clear", "delete", "nuke", "p"],
      args: "<amount:string> [member:member]",
      description: "Mass deletes a certain amount of messages.",
      requiredperms: "manageMessages",
      staff: true,
      cooldown: 3,
    });
  }

  getOldestPossibleSnowflake() {
    return BigInt(Date.now()) - BigInt(1420070400000) << BigInt(22);
  }

  compareSnowflake(num1, num2) {
    return BigInt(num1) > BigInt(num2);
  }

  // Figures out what messages to delete
  async deleteStrategy(msg, messages) {
    if (!messages.length) return;
    if (messages.length === 1) {
      return msg.channel.deleteMessage(messages[0]);
    } else if (messages.length > 1 && messages.length <= 100) {
      return msg.channel.deleteMessages(messages);
    } else {
      const messageCopy = [...messages];
      const deleteMessages = async () => {
        if (messageCopy.length >= 100) {
          const toDelete = messageCopy.splice(0, 100);
          await msg.channel.deleteMessages(toDelete);
          await new Promise(rs => setTimeout(() => rs(), 500));
          return deleteMessages();
        }
        await msg.channel.deleteMessages(messageCopy);
        return true;
      };
      return deleteMessages();
    }
  }

  async run(msg, [messageCount, userToDelete, invert]) {
    // Looks for a valid member
    if (isNaN(messageCount)) return this.bot.embed("❌ Error", "Invalid number of messages was given.", MSG, "error");
    const member = await msg.channel.guild.members.find(m => m.id === userToDelete ||
      `<@${m.id}>` === userToDelete || `<@!${m.id}>` === userToDelete);

    // Checks message count
    if (messageCount <= 0) return this.bot.embed("❌ Error", "You can't purge less than one message.", msg, "error");
    if (messageCount > 200) return this.bot.embed("❌ Error", `You can't purge more than 200 messages at a time.`, msg, "error");
    if (invert && invert.toLowerCase() !== "--invert") invert = undefined;

    // Grabs messages; asks for response
    const messages = await msg.channel.getMessages(parseInt(messageCount) + 1);
    const purgemsg = await this.bot.embed(
      "💣 Purge",
      `Are you sure you want to purge **${messageCount}** messages? ${invert !== undefined ? "(Inverted)" : ""}`,
      msg,
    );

    const resp = await yn(this.bot, { author: msg.author, channel: msg.channel }, true);
    if (resp && resp.response === true) {
      if (resp.msg) resp.msg.delete();
      await msg.delete(`Purged by ${this.bot.tag(msg.author)}`);
      const toDelete = messages.filter(m => {
        if (!member) return true;
        if (invert && m.author.id === member.id) return false;
        if (member && m.author.id === member.id && !invert) return true;
        return true;
      }).map(m => m.id);
      try {
        // Tries to delete the messages
        await this.deleteStrategy(msg, toDelete.filter(m => !this.compareSnowflake(m, this.getOldestPossibleSnowflake())));
      } catch (err) {
        return this.bot.embed(
          "❌ Error",
          "Some messages couldn't be purged. If they're over 14 days old, you'll have to delete them manually.",
          msg,
          "error",
        );
      }

      this.bot.embed("💣 Purge", `**${msg.author.username}** deleted **${messages.length - 1}** messages.`, purgemsg).catch(() => {});
      setTimeout(() => { purgemsg.delete().catch(() => {}); }, 4000);
    } else this.bot.embed.edit("💣 Purge", "Cancelled purging.", purgemsg).catch(() => {});
  }
}

module.exports = purgeCommand;
