/**
 * @file Event listener for guildCreate.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { bot } from "@/root/bot.js";
import { HibikiColors } from "@/utils/constants.js";
import { env } from "@/utils/env.js";
import { logger } from "@/utils/logger.js";
import {
  ChannelType,
  EmbedBuilder,
  type Guild,
  TimestampStyles,
  time,
} from "discord.js";

export const guildCreate: HibikiEvent<"guildCreate"> = {
  event: "guildCreate",
  once: false,

  async runEvent(guild: Guild) {
    logger.info(`Added to guild ${guild.name} (${guild.id})`);

    // Send a message to DISCORD_DEV_CHANNEL_ID
    if (env.DISCORD_DEV_CHANNEL_ID && env.DISCORD_DEV_GUILD_ID) {
      // Gets the owner and the channel
      const owner = await guild
        .fetchOwner()
        .then((guildOwner) => {
          return guildOwner;
        })
        .catch(() => {
          return;
        });

      const channel = await bot.channels.fetch(env.DISCORD_DEV_CHANNEL_ID);
      if (!channel || channel.type !== ChannelType.GuildText) {
        return;
      }

      // Creates the initial embed
      const embed = new EmbedBuilder()
        .setTitle(`✅ Added to ${guild.name}`)
        .setColor(HibikiColors.Success)
        .addFields(
          {
            name: "ID",
            value: guild.id,
            inline: false,
          },
          {
            name: "Created",
            value: time(guild.createdAt, TimestampStyles.LongDateTime),
            inline: false,
          },
        )
        .setImage(guild.bannerURL())
        .setThumbnail(guild.iconURL());

      // Owner details
      if (owner) {
        embed.addFields({
          name: "Owner",
          value: `${owner.user.username} (${owner.id})`,
          inline: false,
        });
      }

      // Member count
      if (guild.memberCount) {
        embed.addFields({
          name: "Members",
          value: guild.memberCount.toString(),
          inline: false,
        });
      }

      // Logs to the logging channel
      await channel.send({
        embeds: [embed],
      });
    }
  },
};
