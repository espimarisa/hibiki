import { Message, TextChannel } from "eris";
import { Command, CommandCategories, LocaleString } from "../../classes/Command";
import { HibikiClient } from "../../classes/Client";

class SplashBannerCommand extends Command {
  name = "splashbanner";
  category = CommandCategories.GENERAL;
  aliases = ["splash"];
  description = "Sends the server's splash page banner.";

  run(msg: Message<TextChannel>, string: LocaleString, bot: HibikiClient) {
    // Sends if a guild has no splash banner
    if (!msg.channel.guild.splashURL) {
      return msg.channel.createMessage({
        embed: {
          title: string("global.ERROR"),
          description: string("general.SPLASHBANNER_ERROR"),
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
          url: msg.channel.guild.dynamicSplashURL(),
        },
        footer: {
          icon_url: msg.author.dynamicAvatarURL(),
          text: string("global.RAN_BY_FOOTER", { author: bot.tagUser(msg.author) }),
        },
      },
    });
  }
}

export default new SplashBannerCommand();
