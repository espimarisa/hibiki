import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { defaultAvatar } from "../../utils/constants";

export class IconCommand extends Command {
  aliases = ["guildicon", "servericon"];
  description = "Sends the server's icon.";

  async run(msg: Message<TextChannel>) {
    msg.channel.createMessage({
      embed: {
        color: msg.convertHex("general"),
        author: {
          icon_url: msg.channel.guild.iconURL || defaultAvatar,
          name: msg.channel.guild.name,
        },
        image: {
          url: msg.channel.guild.dynamicIconURL(),
        },
        footer: {
          icon_url: msg.author.dynamicAvatarURL(),
          text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
        },
      },
    });
  }
}
