const Command = require("../../structures/Command");
const hierarchy = require("../../utils/hierarchy");
const yn = require("../../utils/ask").yesNo;

class forcebanCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["banid", "fb", "hackban", "hb", "idban"],
      args: "<userids:string>",
      description: "Bans a member that isn't in the server.",
      clientperms: "banMembers",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args) {
    // Asks for confirmation
    if (args.length > 10) return this.bot.embed("❌ Error", "Only 10 IDs can be forcebanned at a time.", msg, "error");
    const forcebanmsg = await this.bot.embed("⚒ Forceban", `Are you sure you'd like to forceban **${args.join(", ")}**?`, msg);
    const response = await yn(this.bot, { author: msg.author, channel: msg.channel });
    if (!response) return this.bot.embed.edit("⚒ Forceban", `Cancelled forcebanning **${args.join(", ")}**.`, forcebanmsg);

    // Tries to ban the IDs
    const bans = await Promise.all(args.map(async user => {
      const presentMember = msg.channel.guild.members.find(mem => mem.id === user);
      if (presentMember) {
        // Checks role hiearchy
        if (!hierarchy(msg.member, presentMember)) { return { banned: false, user: user }; }
        try {
          // Bans the present member
          await presentMember.ban(0, `Forcebanned by ${this.bot.tag(msg.author, true)}`);
          return { banned: true, user: user };
        } catch (err) {
          return { banned: false, user: user };
        }
      }

      try {
        // Bans the IDs
        await msg.channel.guild.banMember(user, 0, `Forcebanned by ${this.bot.tag(msg.author, true)}`);
        return { banned: true, user: user };
      } catch (err) {
        return { banned: false, user: user };
      }
    }));

    // Sets amount of IDs banned / failed
    const banned = bans.filter(b => b.banned);
    const failed = bans.filter(b => !b.banned);
    if (!banned.length) return this.bot.embed.edit("❌ Error", "Failed to ban all of the IDs given.", forcebanmsg, "error");

    await forcebanmsg.edit({
      embed: {
        title: `⚒ Forcebanned ${banned.length} ID${banned.length > 1 ? "s" : ""}.`,
        description: `**${banned.map(m => m.user).join(", ")}**`,
        color: this.bot.embed.color("general"),
        fields: failed.length ? [{
          name: `${failed.length} ID${failed.length > 1 ? "s" : ""} failed to be banned.`,
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

module.exports = forcebanCommand;
