import type { EmbedField, Guild, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { defaultAvatar } from "../../utils/constants";

import {
  afkTimeoutFormat,
  contentFilterFormat,
  dateFormat,
  featureFormat,
  mfaLevelFormat,
  notificationLevelFormat,
  regionFormat,
  verificationLevelFormat,
} from "../../utils/format";

export class ServerCommand extends Command {
  description = "Returns info about the server.";
  aliases = ["g", "guild", "guildinfo", "serverinfo"];
  allowdisable = false;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[]) {
    let guild: Guild;

    // Lets bot owners return info about other guilds
    pargs?.[0].value && this.bot.config.owners.includes(msg.author.id)
      ? (guild = this.bot.guilds.find((g) => g.name.toLowerCase().startsWith(pargs?.[0].value) || g.id === pargs?.[0].value))
      : (guild = msg.channel.guild);
    if (!guild) return msg.channel.guild;

    // Embed fields
    const fields: EmbedField[] = [];
    const communityChannels: EmbedField[] = [];
    let voice = 0;
    let text = 0;

    // Community rules channel
    if (guild.rulesChannelID) {
      communityChannels.push({
        name: msg.string("general.SERVER_RULES_CHANNEL"),
        value: `${msg.channel.guild.channels.get(guild.rulesChannelID).mention}`,
      });
    }

    // Community system channel
    if (guild.systemChannelID) {
      communityChannels.push({
        name: msg.string("general.SERVER_SYSTEMMESSAGE_CHANNEL"),
        value: msg.channel.guild.channels.get(guild.systemChannelID).mention,
      });
    }

    // Community updates channel
    if (guild.publicUpdatesChannelID) {
      communityChannels.push({
        name: msg.string("general.SERVER_UPDATES_CHANNEL"),
        value: msg.channel.guild.channels.get(guild.publicUpdatesChannelID).mention,
      });
    }

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

    // Creation date
    fields.push({
      name: msg.string("global.CREATED"),
      value: `${dateFormat(guild.createdAt, msg.string)}`,
    });

    // Guild owner
    fields.push({
      name: msg.string("global.OWNER"),
      value: `${msg.tagUser(this.bot.users.get(guild.ownerID)) || guild.ownerID}`,
      inline: true,
    });

    // Guild region
    fields.push({
      name: msg.string("global.REGION"),
      value: `${regionFormat(guild.region)}`,
      inline: true,
    });

    // Member & bot count
    fields.push({
      name: msg.string("global.MEMBERS"),
      value: msg.string("general.SERVER_MEMBERS", { members: guild.memberCount }),
      inline: true,
    });

    // Role amount
    fields.push({
      name: msg.string("global.ROLES"),
      value: `${guild.roles.size}`,
      inline: true,
    });

    // Channel amount
    fields.push({
      name: msg.string("global.CHANNELS"),
      value: msg.string("general.SERVER_CHANNELINFO", { text: text, voice: voice }),
      inline: true,
    });

    // Emoji amount
    if (guild.emojis.length > 0) {
      fields.push({
        name: msg.string("global.EMOJIS"),
        value: `${guild.emojis.length}`,
        inline: true,
      });
    }

    // Message filter options
    fields.push({
      name: msg.string("general.SERVER_MESSAGEFILTER"),
      value: `${contentFilterFormat(msg.string, guild.explicitContentFilter)}`,
      inline: true,
    });

    // Verification level
    fields.push({
      name: msg.string("general.SERVER_VERIFICATION"),
      value: `${verificationLevelFormat(msg.string, guild.verificationLevel)}`,
      inline: true,
    });

    // Notification level
    fields.push({
      name: msg.string("general.SERVER_NOTIFICATION_LEVEL"),
      value: `${notificationLevelFormat(msg.string, guild.defaultNotifications)}`,
      inline: true,
    });

    // MFA level
    fields.push({
      name: msg.string("general.SERVER_2FA"),
      value: mfaLevelFormat(msg.string, guild.mfaLevel),
      inline: true,
    });

    // AFK channel
    if (guild.afkChannelID) {
      fields.push({
        name: msg.string("general.SERVER_AFK_CHANNEL"),
        value: msg.channel.guild.channels.get(guild.afkChannelID).mention,
        inline: true,
      });

      // AFK timeout
      if (guild.afkTimeout !== 0) {
        fields.push({
          name: msg.string("general.SERVER_AFK_TIMEOUT"),
          value: `${afkTimeoutFormat(msg.string, guild.afkTimeout)}`,
          inline: true,
        });
      }
    }

    // Nitro boosters
    if (guild.premiumSubscriptionCount > 0)
      fields.push({
        name: msg.string("general.SERVER_BOOSTERS"),
        value: `${guild.premiumSubscriptionCount}`,
        inline: true,
      });

    // Nitro boost tier
    if (guild.premiumTier > 0)
      fields.push({
        name: msg.string("general.SERVER_BOOSTLEVEL"),
        value: `${guild.premiumTier}`,
        inline: true,
      });

    // Community locale option
    if (guild.preferredLocale && guild.preferredLocale !== "en-US")
      fields.push({
        name: msg.string("general.SERVER_PREFERRED_LANGUAGE"),
        value: guild.preferredLocale,
        inline: true,
      });

    // Community channels
    if (communityChannels.length) {
      fields.push({
        name: msg.string("general.SERVER_COMMUNITY_CHANNELS"),
        value: `${communityChannels.map((c) => `${c.value}: ${c.name}`).join("\n")}`,
        inline: false,
      });
    }

    // Guild boost/community features
    if (guild.features.length)
      fields.push({
        name: msg.string("general.SERVER_FEATURES"),
        value: featureFormat(msg.string, guild.features).join(", "),
        inline: false,
      });

    msg.channel.createMessage({
      embed: {
        description: `${guild.description ?? ""}`,
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
