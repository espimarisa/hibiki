const Command = require("structures/Command");
const format = require("utils/format");
const hierarchy = require("utils/Hierarchy");
const yn = require("utils/ask").YesNo;

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
    if (args.length > 10) return msg.channel.createMessage(this.bot.embed("❌ Error", "Only 10 IDs can be forcebanned at a time.", "error"));
    const forcebanmsg = await msg.channel.createMessage(this.bot.embed("⚒ Forceban", `Are you sure you'd like to forceban **${args.join(", ")}**?`));
    const response = await yn(this.bot, { author: msg.author, channel: msg.channel });
    if (!response) return forcebanmsg.edit(this.bot.embed("⚒ Forceban", `Cancelled forcebanning **${args.join(", ")}**.`));

    // Attempts to ban the IDs
    const bans = await Promise.all(args.map(async user => {
      const m = msg.channel.guild.members.find(mem => mem.id === user);
      if (m) {
        // Checks role hiearchy
        if (!hierarchy(msg.member, m)) { return { banned: false, user: user }; }
        try {
          // Bans the IDs
          await m.ban(0, `Forcebanned by ${format.tag(msg.author, true)}`);
          return { banned: true, user: user };
        } catch (e) {
          return { banned: false, user: user };
        }
      }

      try {
        // Bans the IDs
        await msg.channel.guild.banMember(user, 0, `Forcebanned by ${format.tag(msg.author, true)}`);
        return { banned: true, user: user };
      } catch (e) {
        return { banned: false, user: user };
      }
    }));

    // Sets amount of IDs banned / failed
    const banned = bans.filter(b => b.banned);
    const failed = bans.filter(b => !b.banned);
    if (!banned.length) return await forcebanmsg.edit(this.bot.embed("❌ Error", "Failed to ban all of the IDs given.", "error"));

    await forcebanmsg.edit({
      embed: {
        title: `⚒ Forcebanned ${banned.length} ID${banned.length > 1 ? "s" : ""}.`,
        description: `**${banned.map(m => m.user).join(", ")}**`,
        color: this.bot.embed.color("general"),
        fields: failed.length ? [{
          name: `${failed.length} ID${failed.length > 1 ? "s" : ""} failed to be banned.`,
          value: `${failed.map(m => m.user).join(", ")}`,
        }] : [],
      },
    });
  }
}

module.exports = forcebanCommand;
