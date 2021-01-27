import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class SplashBannerCommand extends Command {
  aliases = ["splash"];
  description = "Sends the server's splash page banner.";

  async run(msg: Message<TextChannel>) {
    // Sends if a guild has no splash banner
    if (!msg.channel.guild.splashURL) {
      return msg.channel.createMessage({
        embed: {
          title: msg.string("global.ERROR"),
          description: msg.string("general.SPLASHBANNER_ERROR"),
          color: msg.convertHex("error"),
          footer: {
            icon_url: msg.author.dynamicAvatarURL(),
            text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          },
        },
      });
    }

    msg.channel.createMessage({
      embed: {
        color: msg.convertHex("general"),
        author: {
          icon_url: msg.channel.guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
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
