import type { Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { roleHierarchy } from "../../utils/hierarchy";

export class UnmuteCommand extends Command {
  description = "Unmutes a member.";
  clientperms = ["manageRoles"];
  requiredperms = ["manageRoles"];
  args = "<member:member&strict> [reason:string]";
  aliases = ["um", "unsilence", "unshutup"];
  staff = true;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[], args: string[]) {
    const member = pargs[0].value as Member;
    const guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);
    let reason = args.slice(1).join(" ");
    if (reason.length > 512) reason = reason.slice(0, 512);

    // If the bot's role isn't high enough to update the member's role
    if (!roleHierarchy(msg.channel.guild.members.get(this.bot.user.id), member)) {
      return msg.createEmbed(
        msg.locale("global.ERROR"),
        msg.locale("global.ERROR_ROLEUPDATE_TOOLOW", { member: msg.tagUser(member.user) }),
        "error",
      );
    }

    // If a member already has the role
    if (!member.roles?.includes(guildconfig.mutedRole)) {
      return msg.createEmbed(
        msg.locale("global.ERROR"),
        msg.locale("moderation.UNMUTE_DOESNTHAVE", { member: msg.tagUser(member.user) }),
        "error",
      );
    }

    // If member has roles
    const mutecache = await this.bot.db.getUserGuildMuteCache(msg.channel.guild.id, member.id);
    const failed: string[] = [];

    // there's our problem -->
    if (mutecache?.length) {
      const added: string[] = [];
      mutecache.forEach((cache) => {
        cache.roles.forEach(async (role) => {
          if (added.includes(role)) return;
          try {
            // Adds previously cached roles
            await msg.channel.guild.addMemberRole(member.id, role, `Unmuted by ${msg.tagUser(msg.author, true)}`);
            added.push(role);
          } catch (err) {
            failed.push(msg.channel.guild.roles?.get(role).name || msg.locale("global.UNKNOWN"));
          }
        });
      });
      await this.bot.db.deleteUserGuildMuteCache(msg.channel.guild.id, member.id);
    }

    // Removes the muted role
    try {
      await member.removeRole(guildconfig.mutedRole, `Unmuted by ${msg.tagUser(msg.author, true)}`);
    } catch (err) {
      return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("moderation.UNMUTE_FAILED"), "error");
    }

    // If some roles failed to be removed
    if (failed.length) {
      msg.createEmbed(
        msg.locale("global.ERROR"),
        msg.locale("moderation.UNMUTE_FAILEDROLES", {
          member: msg.tagUser(member.user),
          roles: failed.map((f) => `\`${f}\``),
        }),
        "error",
      );
    } else {
      // If no roles failed
      msg.createEmbed(
        msg.locale("global.SUCCESS"),
        msg.locale("moderation.UNMUTE_SUCCESS", { member: msg.tagUser(member.user) }),
        "success",
      );
    }

    this.bot.emit("memberUnmute", msg.channel.guild, member.user, msg.author, reason);
  }
}
