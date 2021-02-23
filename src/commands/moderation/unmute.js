const Command = require("../../structures/Command");

class unmuteCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["um", "unsilence"],
      args: "<member:member&strict> [reason:string]",
      description: "Unmutes a member.",
      clientperms: "manageRoles",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    const guildconfig = await this.bot.db.table("guildconfig").get(msg.channel.guild.id).run();

    if (!guildconfig || !guildconfig.mutedRole) {
      await this.bot.db.table("guildconfig").insert({
        id: msg.channel.guild.id,
      }).run();

      return this.bot.embed("❌ Error", "The muted role hasn't been configured yet.", msg, "error");
    }

    // If member doesn't have role
    if (!user.roles.includes(guildconfig.mutedRole)) {
      return this.bot.embed("❌ Error", `**${user.username}** isn't muted.`, msg, "error");
    }

    // Filters mutecache
    const mutecache = await this.bot.db.table("mutecache").filter({
      member: user.id,
      guild: msg.channel.guild.id,
    }).run();

    try {
      await user.removeRole(guildconfig.mutedRole, `Unmuted by ${this.bot.tag(msg.author)}`);
    } catch (err) {
      return this.bot.embed("❌ Error", `Failed to remove the muted role from **${user.username}**.`, msg, "error");
    }

    // Re-adds the original roles
    mutecache.forEach(async roles => {
      if (!roles.role) return;
      await msg.channel.guild.addMemberRole(user.id, roles.role);
    });

    // Clears mutecache
    this.bot.emit("memberUnmute", msg.channel.guild, msg.member, user);
    this.bot.embed("✅ Success", `**${user.username}** was unmuted.`, msg, "success");
    await this.bot.db.table("mutecache").filter({
      member: user.id,
      guild: msg.channel.guild.id,
    }).delete().run();
  }
}

module.exports = unmuteCommand;
