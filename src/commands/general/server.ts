import type { EmbedField, Guild, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { defaultAvatar } from "../../helpers/constants";
import { dateFormat, featureFormat, regionFormat, verificationLevelFormat } from "../../utils/format";
import config from "../../../config.json";

export class ServerCommand extends Command {
  description = "Returns info about the server.";
  aliases = ["g", "guild", "guildinfo", "serverinfo"];

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[]) {
    let guild: Guild;

    // Lets bot owners return info about other guilds
    pargs?.[0].value && config.owners.includes(msg.author.id)
      ? (guild = this.bot.guilds.find((g) => g.name.toLowerCase().startsWith(pargs?.[0].value) || g.id === pargs?.[0].value))
      : (guild = msg.channel.guild);
    if (!guild) return msg.channel.guild;

    // Embed fields
    const fields: EmbedField[] = [];

    let voice = 0;
    let text = 0;
    // Seperates voice & text
    guild.channels.forEach((channel) => {
      if (channel.type === 0) text++;
      if (channel.type === 2) voice++;
    });

    // Guild ID
    fields.push({
      name: msg.string("global.ID"),
      value: guild.id,
    });

    fields.push({
      name: msg.string("global.CREATED"),
      value: `${dateFormat(guild.createdAt)}`,
    });

    fields.push({
      name: msg.string("global.OWNER"),
      value: `${msg.tagUser(this.bot.users.get(guild.ownerID))}`,
      inline: true,
    });

    fields.push({
      name: msg.string("global.REGION"),
      value: `${regionFormat(guild.region)}`,
      inline: true,
    });

    fields.push({
      name: msg.string("global.MEMBERS"),
      value: msg.string("general.SERVER_MEMBERS", { members: msg.channel.guild.memberOnlyCount, bots: msg.channel.guild.botCount }),
      inline: true,
    });

    fields.push({
      name: msg.string("global.ROLES"),
      value: `${guild.roles.size}`,
      inline: true,
    });

    fields.push({
      name: msg.string("global.CHANNELS"),
      value: msg.string("general.SERVER_CHANNELINFO", { text: text, voice: voice }),
      inline: true,
    });

    if (guild.emojis.length > 0) {
      fields.push({
        name: msg.string("global.EMOJIS"),
        value: `${guild.emojis.length}`,
        inline: true,
      });
    }

    if (guild.explicitContentFilter > 0)
      fields.push({
        name: msg.string("general.SERVER_MESSAGEFILTER"),
        value: `Level ${guild.explicitContentFilter}`,
        inline: true,
      });

    if (guild.verificationLevel > 0)
      fields.push({
        name: msg.string("general.SERVER_VERIFICATION"),
        value: verificationLevelFormat(msg.string, guild.verificationLevel),
        inline: true,
      });

    if (guild.mfaLevel === 1)
      fields.push({
        name: msg.string("general.SERVER_2FA"),
        value: msg.string("global.TRUE"),
        inline: true,
      });

    if (guild.defaultNotifications === 0)
      fields.push({
        name: msg.string("general.SERVER_NOTIFICATIONS"),
        value: "All messages",
        inline: true,
      });

    if (guild.premiumSubscriptionCount > 0)
      fields.push({
        name: msg.string("general.SERVER_BOOSTERS"),
        value: `${guild.premiumSubscriptionCount}`,
        inline: true,
      });

    if (guild.premiumTier > 0)
      fields.push({
        name: msg.string("general.SERVER_BOOSTLEVEL"),
        value: `${guild.premiumTier}`,
        inline: true,
      });

    if (guild.features.length)
      fields.push({
        name: msg.string("general.SERVER_FEATURES"),
        value: featureFormat(msg.string, guild.features).join(", "),
        inline: false,
      });

    msg.channel.createMessage({
      embed: {
        color: msg.convertHex("general"),
        fields: fields,
        author: {
          icon_url: guild.iconURL || defaultAvatar,
          name: guild.name,
        },
        thumbnail: {
          url: guild.iconURL || defaultAvatar,
        },
        footer: {
          text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
