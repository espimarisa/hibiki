const Command = require("../../structures/Command");

class nicknameCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["nick", "set-nick", "set-nickname"],
      args: "<member:member&strict> [nickname:string]",
      description: "Changes a user's nickname.",
      clientperms: "manageNicknames",
      requiredperms: "manageNicknames",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    const nickname = args[1];

    // Clears nicknames
    if (nickname === "clear") {
      try {
        await msg.channel.guild.members.get(user.id).edit({ nick: null }, `Changed by ${this.bot.tag(msg.author, true)}`);
      } catch (err) {
        return this.bot.embed("❌ Error", `Failed to clear **${user.username}**'s nickname.`, msg, "error");
      }

      return this.bot.embed("✅ Success", "Nickname was cleared.", msg, "success");
    }

    // Shows user's nickname
    if (!nickname && user.nick) {
      return this.bot.embed("📛 Nickname", `**${user.username}**'s nickname is \`${user.nick}\`.`, msg);
    }

    // If user has no nickname
    if (!nickname && !user.nick) {
      return this.bot.embed("❌ Error", `**${user.username}** doesn't have a nickname set.`, msg, "error");
    }

    // If nickname is too long
    if (nickname.length > 32) {
      return this.bot.embed("❌ Error", "Nickname must be 32 characters or less.", msg, "error");
    }

    // Updates the nickname
    try {
      await msg.channel.guild.members.get(user.id).edit({ nick: nickname }, `Changed by ${this.bot.tag(msg.author, true)}`);
    } catch (err) {
      return this.bot.embed("❌ Error", `Failed to change **${user.username}**'s nickname.`, msg, "error");
    }

    this.bot.embed("✅ Success", `**${user.username}**'s nickname was ${!nickname.length ? "re" : ""}set.`, msg, "success");
  }
}

module.exports = nicknameCommand;
