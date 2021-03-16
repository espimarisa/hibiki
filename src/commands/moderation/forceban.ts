import type { EmbedField, Message, TextChannel } from "eris";
import type { ResponseData } from "../../typings/utils";
import { Command } from "../../classes/Command";
import { askYesNo } from "../../utils/ask";
import { getRESTUser } from "../../utils/getRESTUser";
import { roleHierarchy } from "../../utils/hierarchy";
import { timeoutHandler } from "../../utils/waitFor";

export class ForcebanCommand extends Command {
  description = "Bans one or more members by their user ID.";
  clientperms = ["banMembers"];
  requiredperms = ["banMembers"];
  args = "<userID:string>";
  aliases = ["fb", "hackban"];
  staff = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    // Max # of bans
    if (args.length > 10) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.FORCEBAN_TOOLONG"), "error");
    }

    // Asks for confirmation
    const banmsg = await msg.createEmbed(
      `🔨 ${msg.string("moderation.BAN")}`,
      msg.string("moderation.PUNISHMENT_CONFIRMATION", {
        member: args.map((b) => `\`${b}\``).join(", "),
        type: msg.string("moderation.BAN").toLowerCase(),
      }),
    );

    const response = (await askYesNo(this.bot, msg.string, msg.author.id, msg.channel.id).catch((err) =>
      timeoutHandler(err, banmsg, msg.string),
    )) as ResponseData;

    // If banning is cancelled
    if (response?.response === false) {
      return banmsg.editEmbed(`🔨 ${msg.string("moderation.BAN")}`, msg.string("moderation.FORCEBAN_CANCELLED"), "error");
    }

    // Tries to ban the IDs
    const usernames: EmbedField[] = [];
    const bans = await Promise.all(
      args.map(async (id) => {
        id = id.replace(",", "");
        if (!id) return { banned: false, user: id };

        // Role hiaearchy
        if (msg.channel.guild.members?.find((m) => m.id === id)) {
          // Gets guild member
          const member = msg.channel.guild.members?.get(id);

          // If bot doesn't have high enough role
          if (!roleHierarchy(msg.channel.guild.members?.get(this.bot.user.id), member)) {
            return { banned: false, user: `${msg.tagUser(member.user)}` };
          }

          // If the author has too low of a role
          if (!roleHierarchy(msg.channel.guild.members?.get(msg.author.id), member)) {
            return { banned: false, user: `${msg.tagUser(member.user)}` };
          }

          try {
            await msg.channel.guild.banMember(id, 0, `Forcebanned by ${msg.tagUser(msg.author, true)}`);

            // User info
            usernames.push({
              name: `${msg.tagUser(member.user)}`,
              value: member.id,
            });

            return { banned: true, user: `${msg.tagUser(member.user)}` };
          } catch (err) {
            return { banned: false, user: `${msg.tagUser(member.user)}` };
          }
        }

        // Checks if it's a valid user
        const user = await getRESTUser(id, this.bot);
        if (!user) return { banned: false, user: id };

        try {
          // Tries to unban
          await msg.channel.guild.banMember(user.id, 0, `Forcebanned by ${msg.tagUser(msg.author, true)}`);

          // User info
          usernames.push({
            name: `${msg.tagUser(user)}`,
            value: user.id,
          });

          return { banned: true, user: id };
        } catch (err) {
          // If a user failed to be banned
          return { banned: false, user: `${msg.tagUser(user)} (${id})` };
        }
      }),
    );

    // Filters banned/failed
    const failedField: EmbedField[] = [];
    const banned = bans.filter((b) => b.banned);
    const failed = bans.filter((b) => !b.banned);

    // If no members were banned
    if (!banned.length) return banmsg.editEmbed(msg.string("global.ERROR"), msg.string("moderation.FORCEBAN_ALLFAILED"), "error");

    // If some failed
    if (failed.length) {
      failedField.push({
        name: msg.string("moderation.FORCEBAN_FAILED"),
        value: failed.map((b) => `\`${b.user}\``).join(", "),
      });
    }

    // Sends confirmation
    await banmsg.edit({
      embed: {
        title: `✅ ${msg.string("moderation.FORCEBAN_BANNED", { amount: banned.length })}`,
        description: `${usernames.map((u) => `\`${u.name}\``).join(", ")}`,
        fields: failedField,
        color: msg.convertHex("success"),
        footer: {
          text: `${msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) })}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
