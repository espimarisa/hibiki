const Command = require("../../structures/Command");

class unbanCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["idunban", "ub", "unbanid"],
      args: "<userids:string>",
      description: "Unbans a member by their ID.",
      clientperms: "banMembers",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args) {
    // Only 10 IDs can be unbanned at a time
    if (args.length > 10) return this.bot.embed("❌ Error", "Only 10 IDs can be unbanned at a time.", msg, "error");

    // Attempts to unban
    const unbans = await Promise.all(args.map(async user => {
      try {
        await msg.channel.guild.unbanMember(user, `Unbanned by ${this.bot.tag(msg.author, true)}`);
        return { unbanned: true, user: user };
      } catch (err) {
        return { unbanned: false, user: user };
      }
    }));

    // Sets amount of IDs unbanned / failed
    const unbanned = unbans.filter(b => b.unbanned);
    const failed = unbans.filter(b => !b.unbanned);
    if (!unbanned.length) return this.bot.embed("❌ Error", "Failed to unban all of the IDs given.", msg, "error");

    msg.channel.createMessage({
      embed: {
        title: `⚒ Unbanned ${unbanned.length} ID${unbanned.length > 1 ? "s" : ""}.`,
        description: `**${unbanned.map(m => m.user).join(", ")}**`,
        color: this.bot.embed.color("general"),
        fields: failed.length ? [{
          name: `${failed.length} ID${failed.length > 1 ? "s" : ""} failed to be unbanned.`,
          value: `${failed.map(m => m.user).join(", ")}`,
        }] : [],
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = unbanCommand;
