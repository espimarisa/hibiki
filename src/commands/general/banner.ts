import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class BannerCommand extends Command {
  description = "Sends the server's banner.";

  run(msg: Message<TextChannel>) {
    // Sends if a guild has no banner
    if (!msg.channel.guild.banner) {
      return msg.channel.createMessage({
        embed: {
          title: msg.string("global.ERROR"),
          description: msg.string("general.BANNER_ERROR"),
          color: msg.convertHex("general"),
          footer: {
            icon_url: msg.author.dynamicAvatarURL(),
            text: msg.string("global.RAN_BY", { author: this.bot.tagUser(msg.author) }),
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
          url: msg.channel.guild.dynamicBannerURL(),
        },
        footer: {
          icon_url: msg.author.dynamicAvatarURL(),
          text: msg.string("global.RAN_BY", { author: this.bot.tagUser(msg.author) }),
        },
      },
    });
  }
}
