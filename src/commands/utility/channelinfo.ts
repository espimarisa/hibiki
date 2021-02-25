import type { Message, TextChannel, VoiceChannel } from "eris";
import { Command } from "../../classes/Command";
import { defaultAvatar } from "../../helpers/constants";
import { dateFormat } from "../../utils/format";

export class ChannelinfoCommand extends Command {
  description = "Gets information for a channel.";
  args = "<channel:channel&allowVoice>";
  aliases = ["cinfo"];

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[]) {
    const channel = pargs[0].value as TextChannel;
    const fields = [];

    // Category
    if (channel.parentID)
      fields.push({
        name: msg.string("global.CATEGORY"),
        value: `${msg.channel.guild.channels.get(channel.parentID).name}`,
      });

    // Topic
    if (channel.topic)
      fields.push({
        name: msg.string("global.TOPIC"),
        value: `${channel.topic}`,
      });

    // Creation info
    fields.push({
      name: msg.string("global.CREATED"),
      value: `${dateFormat(channel.createdAt, msg.string)}`,
    });

    // Info for text channels
    if (channel.type === 0)
      fields.push({
        name: msg.string("global.INFO"),
        value: `${msg.string("utility.CHANNELINFO_TEXT", {
          nsfw: channel.nsfw ? 0 : 1,
          position: channel.position,
        })}`,
      });

    // Info for voice channels
    // Eris typings suck!!!
    if (((channel as unknown) as VoiceChannel).type === 2)
      fields.push({
        name: msg.string("global.INFO"),
        value: `${msg.string("utility.CHANNELINFO_VOICE", {
          bitrate: ((channel as unknown) as VoiceChannel).bitrate / 1000,
          limit: ((channel as unknown) as VoiceChannel).userLimit,
        })}`,
      });

    msg.channel.createMessage({
      embed: {
        color: msg.convertHex("general"),
        fields: fields,
        author: {
          icon_url: msg.channel.guild.iconURL || `${defaultAvatar}`,
          name: `#${channel.name} (${msg.string("global.CHANNEL_TYPE", {
            type: channel.type === 0 ? 0 : 1,
          })})`,
        },
        footer: {
          text: `${msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) })}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
