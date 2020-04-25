const Command = require("../../lib/structures/Command");
const hierarchy = require("../../lib/utils/Hierarchy");
const yn = require("../../lib/utils/Ask.js").YesNo;

class kickCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<user:member&strict> [string:reason]",
      aliases: ["k"],
      description: "Kicks a member from the server.",
      requiredPerms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    let reason = args.slice(1).join(" ");
    if (!reason.length) reason = "No reason provided";
    if (reason.length > 512) reason = reason.slice(0, 512);

    // If bot doesn't have high enough role
    if (!hierarchy(msg.channel.guild.members.get(this.bot.user.id), user)) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `I don't have a high enough role to kick **${user.username}**.`, "error"));
    }

    // If author passes hierarchy
    if (hierarchy(msg.member, user)) {
      // Asks for confirmation
      const kickmsg = await msg.channel.createMessage(this.bot.embed("🔨 Kick", `Are you sure you'd like to kick **${user.username}**?`));
      const response = await yn(this.bot, { author: msg.author, channel: msg.channel });
      if (!response) return kickmsg.edit(this.bot.embed("🔨 Kick", `Cancelled kicking **${user.username}**.`));
      // Tries to DM kicked user
      const dmchannel = await user.user.getDMChannel();
      dmchannel.createMessage({
        embed: {
          title: `🚪 Kicked from ${msg.channel.guild.name}`,
          description: `You were kicked for \`${reason}\`.`,
          color: this.bot.embed.colour("general"),
        },
      }).catch(() => {});
      // Tries to kick the user
      await user.kick(reason).catch(() => {});
      // Edits the kickmsg
      await kickmsg.edit(this.bot.embed("🔨 Kick", `**${user.username}** was kicked by **${msg.author.username}**.`));
    }
  }
}

module.exports = kickCommand;
