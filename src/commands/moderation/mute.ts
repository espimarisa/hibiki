import type { Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { validTimeRegex } from "../../helpers/constants";
import { roleHierarchy } from "../../utils/hierarchy";
import { itemExists } from "../../utils/itemExists";

export class MuteCommand extends Command {
  description = "Mutes a member.";
  clientperms = ["manageRoles"];
  requiredperms = ["manageRoles"];
  args = "<member:member&strict> [time:string] [reason:string]";
  aliases = ["m", "silence", "shutup"];
  staff = true;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[], args: string[]) {
    const member = pargs[0].value as Member;
    const guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);
    let muteExpiration: number;
    let reason: string;
    let timeArg: string;
    let time = 0;

    if (args?.[1]) {
      // Finds valid time
      if (validTimeRegex.test(args?.[1])) timeArg = args[1];
      // No time, but a reason was given
      if (!args?.[2] && !validTimeRegex.test(args?.[1])) reason = args.slice(1).join(" ");
      // Both were given
      else if (args?.[1] && args?.[2]) {
        if (validTimeRegex.test(args[1])) timeArg = args[1];
        reason = args.slice(2).join(" ");
      }
    }

    // if specified timeout was given
    if (timeArg) {
      `${timeArg} `.split("").forEach((char: string, i: number) => {
        // Returns if it isn't a proper value
        if (isNaN(parseInt(char))) return;
        if (i === timeArg.length - 1) return;
        let value = timeArg[i + 1].toLowerCase();
        if (!isNaN(parseInt(timeArg[i + 1])) && !isNaN(parseInt(char))) return;
        if (!isNaN(parseInt(char)) && !isNaN(parseInt(timeArg[i - 1]))) char = `${timeArg[i - 1]}${char}`;
        if (timeArg[i + 2] && (value === " " || value === ",") && /[ywdhms]/.exec(timeArg[i + 2].toLowerCase())) value = timeArg[i + 2];

        // Gets exact time given
        if (isNaN(parseInt(value))) {
          switch (value) {
            case "y":
              time += parseInt(char) * 31556736000;
              break;
            case "w":
              time += parseInt(char) * 604800000;
              break;
            case "d":
              time += parseInt(char) * 86400000;
              break;
            case "h":
              time += parseInt(char) * 3600000;
              break;
            case "m":
              time += parseInt(char) * 60000;
              break;
            case "s":
              time += parseInt(char) * 1000;
              break;
          }
        }

        muteExpiration = new Date().getTime() + time;
      });
    }

    if (reason?.length > 512) reason = reason.slice(0, 512);

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
    const roles: string[] = [];
    const failed: string[] = [];

    if (member.roles?.length) {
      member.roles.forEach(async (role) => {
        // Updates roles
        roles.push(role);

        const muteCache = {
          guild: msg.channel.guild.id,
          member: member.id,
          roles: roles,
          expiration: muteExpiration || null,
        };

        await this.bot.db.insertMuteCache(muteCache);

        try {
          await msg.channel.guild.removeMemberRole(member.id, role, `Muted by ${msg.tagUser(msg.author)}`);
          this.bot.muteHandler.muteCache.push(muteCache);
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
