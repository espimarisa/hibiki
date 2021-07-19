import type { EmbedField, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class RemovePointsCommand extends Command {
  description = "Removes one or more reputation points.";
  requiredperms: ["manageMessages"];
  args = "<ids:string>";
  aliases = ["removemerit", "removemerits", "removepoint", "removepoints", "rmmerit", "rmmerits", "rmpoint", "rmpoints"];
  staff = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    // Gets the points
    const points = await Promise.all(
      args.map(async (id) => {
        id = id.replace(",", "");
        if (!id) return { removed: false, point: id };
        const point = await this.bot.db.getUserPoint(id);

        if (!point || point.guild !== msg.channel.guild.id) {
          return { removed: false, point: id };
        }

        // Deletes the warning
        await this.bot.db.deleteUserPoint(point.receiver, id);
        return { removed: true, point: id };
      }),
    );

    // Removed and failed points
    const failedField: EmbedField[] = [];
    const removed = points.filter((p) => p.removed);
    const failed = points.filter((p) => !p.removed);
    if (!removed.length) return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("moderation.POINTS_ALLFAILED"), "error");
    if (failed.length) {
      failedField.push({
        name: msg.locale("moderation.POINTS_FAILED"),
        value: failed.map((p) => p.point).join(", "),
      });
    }

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: `✨ ${msg.locale("moderation.POINTS_REMOVED", { amount: removed.length })}`,
        description: `${removed.map((p) => `\`${p.point}\``).join(", ")}`,
        color: msg.convertHex("general"),
        fields: failedField,
        footer: {
          text: msg.locale("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
