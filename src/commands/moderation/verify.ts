import type { Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { roleHierarchy } from "../../utils/hierarchy";
import { itemExists } from "../../utils/itemExists";

export class VerifyCommand extends Command {
  description = "Gives the verified role to a member.";
  clientperms = ["manageRoles"];
  requiredperms = ["manageRoles"];
  args = "<member:member&strict> [reason:string]";
  aliases = ["t", "trust", "v"];
  staff = true;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[], args: string[]) {
    const member = pargs[0].value as Member;
    const guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);
    let reason = args.slice(1).join(" ");
    if (reason.length > 512) reason = reason.slice(0, 512);

    // If the role isn't yet yet
    if (!guildconfig?.verifiedRole) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.VERIFY_NOTSET"), "error");
    }

    // Deletes the role in the guildconfig if it doesn't exist anymore
    const roleCheck = await itemExists(msg.channel.guild, "role", guildconfig.verifiedRole, this.bot.db, "verifiedRole");
    if (!roleCheck) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.VERIFY_NOTSET"), "error");
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
    if (member.roles?.includes(guildconfig.verifiedRole)) {
      return msg.createEmbed(
        msg.string("global.ERROR"),
        msg.string("moderation.VERIFY_ALREADYHAS", { member: msg.tagUser(member.user) }),
        "error",
      );
    }

    // Tries to update the member's role
    try {
      await member.addRole(guildconfig.verifiedRole, `Verified by ${msg.tagUser(msg.author, true)}`);
    } catch (err) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.VERIFY_FAILED"), "error");
    }

    this.bot.emit("memberVerify", msg.channel.guild, member.user, msg.author, reason, guildconfig.verifiedRole);
    msg.createEmbed(msg.string("global.SUCCESS"), msg.string("moderation.VERIFY_SUCCESS", { member: msg.tagUser(member.user) }), "success");
  }
}
