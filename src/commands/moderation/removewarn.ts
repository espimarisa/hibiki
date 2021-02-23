import type { EmbedField, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class RemovewarnCommand extends Command {
  description = "Removes one or more warnings.";
  requiredperms: ["manageMessages"];
  args = "<ids:string>";
  aliases = ["removepunish", "rmpunish", "removestrike", "removestrikes", "rmstrike", "rmwarn", "removewarning", "removewarnings"];
  staff = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    // Gets the warnings
    const warnings = await Promise.all(
      args.map(async (id) => {
        id = id.replace(",", "");
        if (!id) return { removed: false, warning: id };
        const warning = await this.bot.db.getUserWarning(id);

        if (!warning || warning.guild !== msg.channel.guild.id) {
          return { removed: false, warning: id };
        }

        // Deletes the warning
        await this.bot.db.deleteUserWarning(warning.receiver, id);
        return { removed: true, warning: id };
      }),
    );

    // Removed and failed warnings
    const failedField: EmbedField[] = [];
    const removed = warnings.filter((w) => w.removed);
    const failed = warnings.filter((w) => !w.removed);
    if (!removed.length) return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.WARNINGS_ALLFAILED"), "error");
    if (failed.length) {
      failedField.push({
        name: msg.string("moderation.WARNINGS_FAILED"),
        value: failed.map((w) => w.warning).join(", "),
      });
    }

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: `⚠ ${msg.string("moderation.WARNINGS_REMOVED", { amount: removed.length })}`,
        description: `${removed.map((w) => `\`${w.warning}\``).join(", ")}`,
        color: msg.convertHex("general"),
        fields: failedField,
        footer: {
          text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
