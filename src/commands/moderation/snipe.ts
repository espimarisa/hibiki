import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class SnipeCommand extends Command {
  description = "Sends the latest deleted message in a channel.";

  async run(msg: Message<TextChannel>) {
    const guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);

    // If sniping is explicitly disabled
    if (guildconfig?.snipingEnable === false) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.SNIPE_NOTENABLED"), "error");
    }

    // If sniping permission is set to staff only
    const isNotStaff =
      !msg.member.permissions.has("manageGuild") || (guildconfig?.staffRole && !msg.member?.roles?.includes(guildconfig.staffRole));

    if (guildconfig?.snipingPermission === false && isNotStaff) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.SNIPE_NOPERMS"), "error");
    }

    // Gets the snipe data
    const snipeMessage = this.bot.snipeData[msg.channel.id];
    if (!snipeMessage) return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.SNIPE_NODATA"), "error");

    msg.channel.createMessage({
      embed: {
        description: `${snipeMessage.content}` || "",
        color: msg.convertHex("general"),
        timestamp: new Date(snipeMessage.timestamp || Date.now()),
        author: {
          name: snipeMessage.author ? ` ${msg.string("moderation.SNIPE_MEMBERSAID", { member: snipeMessage.author })}` : "",
          icon_url: snipeMessage.authorpfp || "",
        },
        image: {
          url: snipeMessage.attachment || "",
        },
      },
    });
  }
}
