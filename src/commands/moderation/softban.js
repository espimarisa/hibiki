const Command = require("../../structures/Command");
const hierarchy = require("../../utils/hierarchy");
const yn = require("../../utils/ask").yesNo;

class softbanCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["sb"],
      args: "<member:member> [string:reason]",
      description: "Bans a member from the server without deleting any messages.",
      clientperms: "banMembers",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    let reason = args.slice(1).join(" ");
    if (!reason.length) reason = "No reason provided.";
    else if (reason.length > 512) reason = reason.slice(0, 512);

    // If bot doesn't have high enough role
    if (!hierarchy(msg.channel.guild.members.get(this.bot.user.id), user)) {
      return this.bot.embed("❌ Error", `I don't have a high enough role to softban **${user.username}**.`, msg, "error");
    }

    // If author passes hierarchy
    if (hierarchy(msg.member, user)) {
      // Asks for confirmation
      const softbanmsg = await this.bot.embed("🔨 Softban", `Are you sure you'd like to softban **${user.username}**?`, msg);
      const response = await yn(this.bot, { author: msg.author, channel: msg.channel });
      if (!response) return this.bot.embed.edit("🔨 Softban", `Cancelled softbanning **${user.username}**.`, softbanmsg);

      // Tries to ban the user; deletes no messages
      try {
        await user.ban(0, `${reason} (by ${this.bot.tag(msg.author, true)})`).catch(() => {});
      } catch (err) {
        return this.bot.embed.edit("❌ Error", `Failed to softban **${user.username}**.`, softbanmsg, "error");
      }

      // Tries to DM banned user
      const dmchannel = await user.user.getDMChannel().catch(() => {});

      if (dmchannel) {
        dmchannel.createMessage({
          embed: {
            title: `🚪 Banned from ${msg.channel.guild.name}`,
            description: `You were banned for \`${reason}\`.`,
            color: this.bot.embed.color("general"),
          },
        }).catch(() => {});
      }

      this.bot.embed.edit("🔨 Softban", `**${user.username}** was banned by **${msg.author.username}**.`, softbanmsg);
    }
  }
}

module.exports = softbanCommand;
