import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { defaultAvatar } from "../../utils/constants";

export class BannerCommand extends Command {
  description = "Sends the server's banner.";

  async run(msg: Message<TextChannel>) {
    // Sends if a guild has no banner
    if (!msg.channel.guild.banner) return msg.createEmbed(msg.string("global.ERROR"), msg.string("general.BANNER_ERROR"), "error");

    // Sends the banner
    msg.channel.createMessage({
      embed: {
        color: msg.convertHex("general"),
        author: {
          icon_url: msg.channel.guild.dynamicIconURL() || defaultAvatar,
          name: msg.channel.guild.name,
        },
        image: {
          url: msg.channel.guild.dynamicBannerURL(),
        },
        footer: {
          icon_url: msg.author.dynamicAvatarURL(),
          text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
        },
      },
    });
  }
}
