import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { defaultAvatar } from "../../helpers/constants";

export class SplashBannerCommand extends Command {
  aliases = ["splash"];
  description = "Sends the server's splash page banner.";

  async run(msg: Message<TextChannel>) {
    // Sends if a guild has no splash banner
    if (!msg.channel.guild.splashURL) return msg.createEmbed(msg.string("global.ERROR"), msg.string("general.SPLASHBANNER_ERROR"));

    // Sends the banner
    msg.channel.createMessage({
      embed: {
        color: msg.convertHex("general"),
        author: {
          icon_url: msg.channel.guild.dynamicIconURL() || defaultAvatar,
          name: msg.channel.guild.name,
        },
        image: {
          url: msg.channel.guild.dynamicSplashURL(),
        },
        footer: {
          icon_url: msg.author.dynamicAvatarURL(),
          text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
        },
      },
    });
  }
}
