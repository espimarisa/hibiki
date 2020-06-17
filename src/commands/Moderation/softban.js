const Command = require("structures/Command");
const format = require("utils/format");
const hierarchy = require("utils/Hierarchy");
const yn = require("utils/ask").YesNo;

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
    if (!reason.length) reason = "No reason given.";
    if (reason.length > 512) reason = reason.slice(0, 512);

    // If bot doesn't have high enough role
    if (!hierarchy(msg.channel.guild.members.get(this.bot.user.id), user)) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `I don't have a high enough role to softban **${user.username}**.`, "error"));
    }

    // If author passes hierarchy
    if (hierarchy(msg.member, user)) {
      // Asks for confirmation
      const softbanmsg = await msg.channel.createMessage(this.bot.embed("🔨 Softban", `Are you sure you'd like to softban **${user.username}**?`));
      const response = await yn(this.bot, { author: msg.author, channel: msg.channel });
      if (!response) return softbanmsg.edit(this.bot.embed("🔨 Softban", `Cancelled softbanning **${user.username}**.`));
      await user.ban(0, `${reason} (by ${format.tag(msg.author, true)})`).catch(() => {});


      // Tries to DM banned user
      const dmchannel = await user.user.getDMChannel().catch(() => {});
      dmchannel.createMessage({
        embed: {
          title: `🚪 Banned from ${msg.channel.guild.name}`,
          description: `You were banned for \`${reason}\`.`,
          color: this.bot.embed.color("general"),
        },
      }).catch(() => {});

      await softbanmsg.edit(this.bot.embed("🔨 Softban", `**${user.username}** was banned by **${msg.author.username}**.`));
    }
  }
}

module.exports = softbanCommand;
