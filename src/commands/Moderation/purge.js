const Command = require("../../lib/structures/Command");
const yn = require("../../lib/utils/Ask").YesNo;
const format = require("../../lib/scripts/Format");

class purgeCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<amount:string> [member:member]",
      aliases: ["clear", "delete", "nuke", "p"],
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
    if (isNaN(messageCount)) return msg.channel.createMessage(this.bot.embed("❌ Error", "Invalid number of messages was given.", "error"));
    const member = await msg.channel.guild.members.find(m => m.id === userToDelete || `<@${m.id}>` === userToDelete || `<@!${m.id}>` === userToDelete);
    // Checks message count
    if (messageCount <= 0) return msg.channel.createMessage(this.bot.embed("❌ Error", "You can't purge less than one message.", "error"));
    if (messageCount > 200) return msg.channel.createMessage(this.bot.embed("❌ Error", `You can't purge more than 200 messages at a time.`, "error"));
    if (invert && invert.toLowerCase() !== "--invert") invert = undefined;
    // Grabs messages; asks for response
    const messages = await msg.channel.getMessages(parseInt(messageCount) + 1);
    const purgemsg = await msg.channel.createMessage(this.bot.embed("💣 Purge", `Are you sure you want to purge **${messageCount}** messages? ${invert !== undefined ? "(Inverted)" : ""}`));
    const resp = await yn(this.bot, { author: msg.author, channel: msg.channel }, true);
    if (resp && resp.response === true) {
      // Deletes the answer
      if (resp.msg) resp.msg.delete();
      await msg.delete(`Purged by ${format.tag(msg.author)}`);
      const toDelete = messages.filter(m => {
        if (!member) return true;
        if (invert && m.author.id === member.id) return false;
        if (member && m.author.id === member.id && !invert) return true;
        return true;
      }).map(m => m.id);
      try {
        // Tries to delete the messages
        await this.deleteStrategy(msg, toDelete.filter(m => !this.compareSnowflake(m, this.getOldestPossibleSnowflake())));
      } catch (e) {
        return msg.channel.createMessage(this.bot.embed("❌ Error", "One or more messages couldn't be deleted. If they're over 14 days old, they can't be purged.", "error"));
      }
      // Sends the embed; deletes after 4 seconds
      purgemsg.edit(this.bot.embed("💣 Purge", `**${msg.author.username}** deleted **${messages.length - 1}** messages.`)).catch(() => {});
      setTimeout(() => { purgemsg.delete().catch(() => {}); }, 4000);
      // Sends cancel embed
    } else purgemsg.edit(this.bot.embed("💣 Purge", "Cancelled purging.")).catch(() => {});
  }
}

module.exports = purgeCommand;
