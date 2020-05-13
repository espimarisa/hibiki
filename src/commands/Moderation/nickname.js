const Command = require("../../lib/structures/Command");
const format = require("../../lib/scripts/Format");

class nicknameCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["nick", "set-nick", "set-nickname"],
      args: "<member:string> [nickname:string]",
      description: "Changes a user's nickname.",
      clientperms: "manageNicknames",
      requiredperms: "manageNicknames",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    const nickname = args[1];
    if (!nickname || !nickname.length) {
      await msg.channel.guild.members.get(user).edit({ nick: null }, `Changed by ${format.tag(msg.author, true)}`);
      return msg.channel.createMessage(this.bot.embed("✅ Success", "Nickname was cleared.", "success"));
    } else if (nickname.length > 32) return msg.channel.createMessage(this.bot.embed("❌ Error", "Nickname must be 32 characters or less.", "error"));
    // Changes the member's nickname
    await msg.channel.guild.members.get(user).edit({ nick: nickname }, `Changed by ${format.tag(msg.author, true)}`).catch(() => {});
    msg.channel.createMessage(this.bot.embed("✅ Success", `Nickname was ${!nickname.length ? "re" : ""}set.`, "success"));
  }
}

module.exports = nicknameCommand;
