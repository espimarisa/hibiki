import type { Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { roleHierarchy } from "../../utils/hierarchy";
import { itemExists } from "../../utils/itemExists";

export class MuteCommand extends Command {
  description = "Mutes a member.";
  clientperms = ["manageRoles"];
  requiredperms = ["manageRoles"];
  args = "<member:member&strict> [reason:string]";
  aliases = ["m", "silence", "shutup"];
  staff = true;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[], args: string[]) {
    const member = pargs[0].value as Member;
    const guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);
    let reason = args.slice(1).join(" ");
    if (reason.length > 512) reason = reason.slice(0, 512);

    // If the role isn't yet yet
    if (!guildconfig?.mutedRole) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.MUTE_NOTSET"), "error");
    }

    // Deletes the role in the guildconfig if it doesn't exist anymore
    const roleCheck = await itemExists(msg.channel.guild, "role", guildconfig.mutedRole, this.bot.db, "mutedRole");
    if (!roleCheck) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.MUTE_NOTSET"), "error");
    }

    // If the bot's role isn't high enough to update the member's role
    if (!roleHierarchy(msg.channel.guild.members.get(this.bot.user.id), member)) {
      return msg.createEmbed(
        msg.string("global.ERROR"),
        msg.string("global.ERROR_ROLEUPDATE_TOOLOW", { member: msg.tagUser(member.user) }),
        "error",
      );
    }

    // If a member already has the role
    if (member.roles?.includes(guildconfig.mutedRole)) {
      return msg.createEmbed(
        msg.string("global.ERROR"),
        msg.string("moderation.MUTE_ALREADYHAS", { member: msg.tagUser(member.user) }),
        "error",
      );
    }

    // If member has roles
    const failed: string[] = [];
    if (member.roles?.length) {
      member.roles.forEach(async (role) => {
        await this.bot.db.insertMuteCache({ guild: msg.channel.guild.id, member: member.id, role: role });
        // Removes other roles
        try {
          await msg.channel.guild.removeMemberRole(member.id, role, `Muted by ${msg.tagUser(msg.author)}`);
        } catch (err) {
          failed.push(msg.channel.guild.roles?.get(role).name || role);
        }
      });
    }

    // If member has no roles
    try {
      await member.addRole(guildconfig.mutedRole, `Unmuted by ${msg.tagUser(msg.author, true)}`);
    } catch (err) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.MUTE_FAILED"), "error");
    }

    // If some roles failed to be removed
    if (failed.length) {
      msg.createEmbed(
        msg.string("global.ERROR"),
        msg.string("moderation.MUTE_FAILEDROLES", {
          member: msg.tagUser(member.user),
          roles: failed.map((f) => `\`${f}\``),
        }),
        "error",
      );
    } else {
      // If no roles failed
      msg.createEmbed(msg.string("global.SUCCESS"), msg.string("moderation.MUTE_SUCCESS", { member: msg.tagUser(member.user) }), "success");
    }

    this.bot.emit("memberMute", msg.channel.guild, member.user, msg.author, reason);
  }
}
