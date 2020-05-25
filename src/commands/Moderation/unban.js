const Command = require("../../lib/structures/Command");
const format = require("../../lib/scripts/Format");

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
    // Asks for confirmation
    if (args.length > 10) return msg.channel.createMessage(this.bot.embed("❌ Error", "Only 10 IDs can be unbanned at a time.", "error"));
    // Attempts to unban the IDs
    const unbans = await Promise.all(args.map(async user => {
      try {
        await msg.channel.guild.unbanMember(user, `Unbanned by ${format.tag(msg.author, true)}`);
        return { unbanned: true, user: user };
      } catch (e) {
        return { unbanned: false, user: user };
      }
    }));

    // Sets amount of IDs unbanned / failed
    const unbanned = unbans.filter(b => b.unbanned);
    const failed = unbans.filter(b => !b.unbanned);
    if (!unbanned.length) return msg.channel.createMessage(this.bot.embed("❌ Error", "Failed to unban all of the IDs given.", "error"));

    await msg.channel.createMessage({
      embed: {
        title: `⚒ Unbanned ${unbanned.length} ID${unbanned.length > 1 ? "s" : ""}.`,
        description: `**${unbanned.map(m => m.user).join(", ")}**`,
        color: this.bot.embed.color("general"),
        fields: failed.length ? [{
          name: `${failed.length} ID${failed.length > 1 ? "s" : ""} failed to be unbanned.`,
          value: `${failed.map(m => m.user).join(", ")}`,
        }] : [],
      },
    });
  }
}

module.exports = unbanCommand;
