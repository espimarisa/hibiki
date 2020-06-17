const Command = require("structures/Command");
const format = require("utils/format");
const hierarchy = require("utils/Hierarchy");
const yn = require("utils/ask").YesNo;

class kickCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["k"],
      args: "<member:member&strict> [string:reason]",
      description: "Kicks a member from the server.",
      clientperms: "kickMembers",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    let reason = args.slice(1).join(" ");
    if (!reason.length) reason = "No reason given.";
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
      this.bot.emit("guildKick", msg.channel.guild, reason, msg.member, user);
      await user.kick(`${reason} (by ${format.tag(msg.author, true)})`).catch(() => {});

      // Tries to DM kicked user
      const dmchannel = await user.user.getDMChannel().catch(() => {});
      dmchannel.createMessage({
        embed: {
          title: `🚪 Kicked from ${msg.channel.guild.name}`,
          description: `You were kicked for \`${reason}\`.`,
          color: this.bot.embed.color("general"),
        },
      }).catch(() => {});

      await kickmsg.edit(this.bot.embed("🔨 Kick", `**${user.username}** was kicked by **${msg.author.username}**.`));
    }
  }
}

module.exports = kickCommand;
