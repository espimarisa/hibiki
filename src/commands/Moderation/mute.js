const Command = require("structures/Command");
const format = require("utils/format");
const hierarchy = require("utils/Hierarchy");

class muteCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["m", "silence", "shutup"],
      args: "<member:member> [reason:string]",
      description: "Mutes a member.",
      clientperms: "manageRoles",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    let reason = args.slice(1).join(" ");
    if (!reason.length) reason = "No reason given.";
    if (reason.length > 512) reason = reason.slice(0, 512);

    // Reads db; finds role
    const guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);

    if (!guildcfg || !guildcfg.mutedRole) {
      await this.bot.db.table("guildcfg").insert({ id: msg.channel.guild.id });
      return msg.channel.createMessage(this.bot.embed("❌ Error", "The muted role hasn't been configured yet.", "error"));
    }

    // If bot doesn't have high enough role
    if (!hierarchy(msg.channel.guild.members.get(this.bot.user.id), user)) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `I don't have a high enough role to mute **${user.username}**.`, "error"));
    }

    // If member is already muted
    if (user.roles.includes(guildcfg.mutedRole)) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `**${user.username}** already has the muted role.`, "error"));
    }

    // If author is above member
    if (hierarchy(msg.member, user)) {
      await this.bot.db.table("mutecache").insert({
        role: "",
        member: user.id,
        guild: msg.channel.guild.id,
      });

      // Mutes the member
      if (!user.roles.length) {
        await user.addRole(guildcfg.mutedRole, `Muted by ${format.tag(msg.author)} for ${reason}`).catch(() => {
          msg.channel.createMessage(this.bot.embed("❌ Error", `Failed to add the muted role to **${user.username}**.`));
        });
        this.bot.emit("memberMute", msg.channel.guild, msg.member, user, reason);
        return msg.channel.createMessage(this.bot.embed("✅ Success", `**${user.username}** was muted.`, "success"));
      }

      // If member has roles
      await user.roles.forEach(async roles => {
        await this.bot.db.table("mutecache").insert({
          role: roles,
          member: user.id,
          guild: msg.channel.guild.id,
        });

        // Removes other roles
        await msg.channel.guild.removeMemberRole(user.id, roles).catch(() => {
          msg.channel.createMessage(this.bot.embed("❌ Error", `Failed to remove **${user.username}**'s other roles.`, "error"));
        });

        // Mutes the member
        await user.addRole(guildcfg.mutedRole, `Muted by ${format.tag(msg.author)} for ${reason}`).catch(() => {
          msg.channel.createMessage(this.bot.embed("❌ Error", `Failed to add the muted role to **${user.username}**.`));
        });

        this.bot.emit("memberMute", msg.channel.guild, msg.member, user, reason);
        msg.channel.createMessage(this.bot.embed("✅ Success", `**${user.username}** was muted.`, "success"));
      });
    } else {
      // If member doesn't pass hiearchy
      return msg.channel.createMessage(this.bot.embed("❌ Error", `You don't have a high enough role to mute **${user.username}**.`));
    }
  }
}

module.exports = muteCommand;
