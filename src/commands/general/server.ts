/**
 * @file Server command
 * @description Returns info about the server
 */

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
        name: msg.locale("general.SERVER_RULES_CHANNEL"),
        value: `${msg.channel.guild.channels.get(guild.rulesChannelID).mention}`,
      });
    }

    // Community system channel
    if (guild.systemChannelID) {
      communityChannels.push({
        name: msg.locale("general.SERVER_SYSTEMMESSAGE_CHANNEL"),
        value: msg.channel.guild.channels.get(guild.systemChannelID).mention,
      });
    }

    // Community updates channel
    if (guild.publicUpdatesChannelID) {
      communityChannels.push({
        name: msg.locale("general.SERVER_UPDATES_CHANNEL"),
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
      name: msg.locale("global.ID"),
      value: guild.id,
    });

    // Creation date
    fields.push({
      name: msg.locale("global.CREATED"),
      value: `${dateFormat(guild.createdAt, msg.locale)}`,
    });

    // Guild owner
    fields.push({
      name: msg.locale("global.OWNER"),
      value: `${msg.tagUser(this.bot.users.get(guild.ownerID)) || guild.ownerID}`,
      inline: true,
    });

    // Guild region
    fields.push({
      name: msg.locale("global.REGION"),
      value: `${regionFormat(guild.region)}`,
      inline: true,
    });

    // Member & bot count
    fields.push({
      name: msg.locale("global.MEMBERS"),
      value: msg.locale("general.SERVER_MEMBERS", { members: guild.memberCount }),
      inline: true,
    });

    // Role amount
    fields.push({
      name: msg.locale("global.ROLES"),
      value: `${guild.roles.size}`,
      inline: true,
    });

    // Channel amount
    fields.push({
      name: msg.locale("global.CHANNELS"),
      value: msg.locale("general.SERVER_CHANNELINFO", { text: text, voice: voice }),
      inline: true,
    });

    // Emoji amount
    if (guild.emojis.length > 0) {
      fields.push({
        name: msg.locale("global.EMOJIS"),
        value: `${guild.emojis.length}`,
        inline: true,
      });
    }

    // Message filter options
    fields.push({
      name: msg.locale("general.SERVER_MESSAGEFILTER"),
      value: `${contentFilterFormat(msg.locale, guild.explicitContentFilter)}`,
      inline: true,
    });

    // Verification level
    fields.push({
      name: msg.locale("general.SERVER_VERIFICATION"),
      value: `${verificationLevelFormat(msg.locale, guild.verificationLevel)}`,
      inline: true,
    });

    // Notification level
    fields.push({
      name: msg.locale("general.SERVER_NOTIFICATION_LEVEL"),
      value: `${notificationLevelFormat(msg.locale, guild.defaultNotifications)}`,
      inline: true,
    });

    // MFA level
    fields.push({
      name: msg.locale("general.SERVER_2FA"),
      value: mfaLevelFormat(msg.locale, guild.mfaLevel),
      inline: true,
    });

    // AFK channel
    if (guild.afkChannelID) {
      fields.push({
        name: msg.locale("general.SERVER_AFK_CHANNEL"),
        value: msg.channel.guild.channels.get(guild.afkChannelID).mention,
        inline: true,
      });

      // AFK timeout
      if (guild.afkTimeout !== 0) {
        fields.push({
          name: msg.locale("general.SERVER_AFK_TIMEOUT"),
          value: `${afkTimeoutFormat(msg.locale, guild.afkTimeout)}`,
          inline: true,
        });
      }
    }

    // Nitro boosters
    if (guild.premiumSubscriptionCount > 0)
      fields.push({
        name: msg.locale("general.SERVER_BOOSTERS"),
        value: `${guild.premiumSubscriptionCount}`,
        inline: true,
      });

    // Nitro boost tier
    if (guild.premiumTier > 0)
      fields.push({
        name: msg.locale("general.SERVER_BOOSTLEVEL"),
        value: `${guild.premiumTier}`,
        inline: true,
      });

    // Community locale option
    if (guild.preferredLocale && guild.preferredLocale !== "en-US")
      fields.push({
        name: msg.locale("general.SERVER_PREFERRED_LANGUAGE"),
        value: guild.preferredLocale,
        inline: true,
      });

    // Community channels
    if (communityChannels.length) {
      fields.push({
        name: msg.locale("general.SERVER_COMMUNITY_CHANNELS"),
        value: `${communityChannels.map((c) => `${c.value}: ${c.name}`).join("\n")}`,
        inline: false,
      });
    }

    // Guild boost/community features
    if (guild.features.length)
      fields.push({
        name: msg.locale("general.SERVER_FEATURES"),
        value: featureFormat(msg.locale, guild.features).join(", "),
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
          text: msg.locale("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
