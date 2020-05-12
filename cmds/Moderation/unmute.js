const Command = require("../../lib/structures/Command");
const format = require("../../lib/scripts/Format");

class unmuteCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["um", "unsilence"],
      args: "<member:member> [reason:string]",
      description: "Unmutes a member.",
      clientperms: "manageRoles",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;

    // Reads db; finds role
    const guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);
    const mutedrole = await msg.channel.guild.roles.find(r => r.id === guildcfg.mutedRole);

    // If no role or cfg
    if (!guildcfg || !guildcfg.mutedRole || !mutedrole) {
      await this.bot.db.table("guildcfg").insert({ id: msg.channel.guild.id });
      return msg.channel.createMessage(this.bot.embed("❌ Error", "The muted role hasn't been configured yet.", "error"));
    }

    // If member doesn't have role
    if (!user.roles.includes(guildcfg.mutedRole)) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `**${user.username}** isn't muted.`, "error"));
    }

    // Filters mutecache
    const mutecache = await this.bot.db.table("mutecache").filter({
      member: user.id,
      guild: msg.channel.guild.id,
    });

    // Removes the mutedrole
    await user.removeRole(guildcfg.mutedRole, `Unmuted by ${format.tag(msg.author)}`).catch(() => {
      msg.channel.createMessage(this.bot.embed("❌ Error", `Failed to remove the muted role from **${user.username}**.`));
    });

    // Re-adds the original roles
    mutecache.forEach(async roles => {
      if (!roles.role) return;
      await msg.channel.guild.addMemberRole(user.id, roles.role);
    });

    // Clears mutecache
    this.bot.emit("memberUnmute", msg.channel.guild, msg.member, user);
    msg.channel.createMessage(this.bot.embed("✅ Success", `**${user.username}** was unmuted.`, "success"));
    await this.bot.db.table("mutecache").filter({ member: user.id, guild: msg.channel.guild.id }).delete();
  }
}

module.exports = unmuteCommand;
