/**
 * @file Event listener for guildDelete.
 * @license Zlib
 */

import type { HibikiEvent } from "@/helpers/event.ts";
import { client } from "@/root/client.ts";
import { env } from "@/root/utils/env.ts";
import { HibikiColors } from "@/utils/constants.ts";
import { logger } from "@/utils/logger.ts";
import { ChannelType, EmbedBuilder, TimestampStyles, time } from "discord.js";

export const guildDelete: HibikiEvent<"guildDelete"> = {
  event: "guildDelete",

  async handle(guild) {
    // Gets the guild owner.
    const owner = await guild.fetchOwner();

    // String for the guild name.
    const guildName = guild.name
      ? `${guild.name} (${guild.id})`
      : guild.id || "Unknown";

    // String for the guild owner.
    const guildOwner = owner?.user
      ? `${owner.user.username} (${owner.id})`
      : owner.id || "Unknown";

    logger.info(`Removed from guild ${guildName} owned by ${guildOwner}`);

    // Send a message to DISCORD_DEV_CHANNEL_ID if set.
    if (env.DISCORD_DEV_CHANNEL_ID && env.DISCORD_DEV_GUILD_ID) {
      // Gets the channel.
      const channel = await client.channels.fetch(env.DISCORD_DEV_CHANNEL_ID);
      if (!channel || channel.type !== ChannelType.GuildText) {
        return;
      }

      // Creates the embed.
      const embed = new EmbedBuilder()
        .setTitle(`❌ Removed from guild: ${guildName}`)
        .setColor(HibikiColors.Success)
        .addFields(
          {
            name: "ID",
            value: guild.id,
            inline: false,
          },
          {
            name: "Created on",
            value: time(guild.createdAt, TimestampStyles.ShortDateTime),
            inline: false,
          },
        )
        .setImage(guild.bannerURL())
        .setThumbnail(guild.iconURL());

      // Owner.
      embed.addFields({
        name: "Owner",
        value: guildOwner,
        inline: false,
      });

      // Member count.
      if (guild.memberCount) {
        embed.addFields({
          name: "Members",
          value: guild.memberCount.toString(),
          inline: false,
        });
      }

      // Logs to the logging channel.
      await channel.send({ embeds: [embed] });
    }
  },
};
