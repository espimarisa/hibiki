import { Message, TextChannel } from "eris";
import { Command, CommandCategories, LocaleString } from "../../classes/Command";
import { HibikiClient } from "../../classes/Client";

class BannerCommand extends Command {
  name = "banner";
  category = CommandCategories.GENERAL;
  description = "Sends the server's banner.";

  run(msg: Message<TextChannel>, string: LocaleString, bot: HibikiClient) {
    // Sends if a guild has no banner
    if (!msg.channel.guild.banner) {
      return msg.channel.createMessage({
        embed: {
          title: string("global.ERROR"),
          description: string("general.BANNER_ERROR"),
          color: bot.convertHex("error"),
          footer: {
            icon_url: msg.author.dynamicAvatarURL(),
            text: string("global.RAN_BY_FOOTER", { author: bot.tagUser(msg.author) }),
          },
        },
      });
    }

    msg.channel.createMessage({
      embed: {
        color: bot.convertHex("general"),
        author: {
          icon_url: msg.channel.guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
          name: msg.channel.guild.name,
        },
        image: {
          url: msg.channel.guild.dynamicBannerURL(),
        },
        footer: {
          icon_url: msg.author.dynamicAvatarURL(),
          text: string("global.RAN_BY_FOOTER", { author: bot.tagUser(msg.author) }),
        },
      },
    });
  }
}

export default new BannerCommand();
