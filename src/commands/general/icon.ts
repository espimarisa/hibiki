import { Message, TextChannel } from "eris";
import { Command, CommandCategories, LocaleString } from "../../classes/Command";
import { HibikiClient } from "../../classes/Client";
import { defaultAvatar } from "../../helpers/constants";

class IconCommand extends Command {
  name = "icon";
  category = CommandCategories.GENERAL;
  aliases = ["guildicon", "servericon"];
  description = "Sends the server's icon.";

  run(msg: Message<TextChannel>, bot: HibikiClient, string: LocaleString) {
    msg.channel.createMessage({
      embed: {
        color: bot.convertHex("general"),
        author: {
          icon_url: msg.channel.guild.iconURL || defaultAvatar,
          name: msg.channel.guild.name,
        },
        image: {
          url: msg.channel.guild.dynamicIconURL(),
        },
        footer: {
          icon_url: msg.author.dynamicAvatarURL(),
          text: string("global.RAN_BY_FOOTER", { author: bot.tagUser(msg.author) }),
        },
      },
    });
  }
}

export default new IconCommand();
