import type { EmbedField, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { getRESTUser } from "../../utils/getRESTUser";

export class UnbanCommand extends Command {
  description = "Unbans one or more members by their user ID.";
  clientperms = ["banMembers"];
  requiredperms = ["banMembers"];
  args = "<userID:string>";
  aliases = ["ub"];
  staff = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    // Max # of unbans
    if (args.length > 10) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.UNBAN_TOOLONG"), "error");
    }

    // Tries to unban the IDs
    const usernames: EmbedField[] = [];
    const unbans = await Promise.all(
      args.map(async (id) => {
        id = id.replace(",", "");
        if (!id) return { unbanned: false, user: id };

        // Checks if it's a valid user
        const user = await getRESTUser(id, this.bot);
        if (!user) return { unbanned: false, user: id };

        try {
          // Tries to unban
          await msg.channel.guild.unbanMember(user.id, `Unbanned by ${msg.tagUser(msg.author, true)}`);

          // User info
          usernames.push({
            name: `${msg.tagUser(user)}`,
            value: user.id,
          });

          return { unbanned: true, user: id };
        } catch (err) {
          // If a user failed to be unbanned
          return { unbanned: false, user: `${msg.tagUser(user)} (${id})` };
        }
      }),
    );

    // Filters unbanned/failed
    const failedField: EmbedField[] = [];
    const unbanned = unbans.filter((b) => b.unbanned);
    const failed = unbans.filter((b) => !b.unbanned);

    // If no members were unbanned
    if (!unbanned.length) return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.UNBAN_ALLFAILED"), "error");

    // If some failed
    if (failed.length) {
      failedField.push({
        name: msg.string("moderation.UNBAN_FAILED"),
        value: failed.map((b) => `\`${b.user}\``).join(", "),
      });
    }

    // Sends confirmation
    msg.channel.createMessage({
      embed: {
        title: `✅ ${msg.string("moderation.UNBAN_UNBANNED", { amount: unbanned.length })}`,
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
