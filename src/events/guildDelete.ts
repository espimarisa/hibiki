/**
 * @file Event listener for guildDelete.
 * @license Zlib
 */

import { getGuildString, getUserString } from "@/helpers/discord.ts";
import type { HibikiEvent } from "@/helpers/event.ts";
import { client } from "@/root/client.ts";
import { env } from "@/root/utils/env.ts";
import { HibikiColors } from "@/utils/constants.ts";
import { clientLog } from "@/utils/logger.ts";
import { ChannelType, EmbedBuilder, TimestampStyles, time } from "discord.js";

export const guildDelete: HibikiEvent<"guildDelete"> = {
  event: "guildDelete",

  async handle(guild) {
    // Gets the guild owner and name.
    const owner = await guild.fetchOwner();
    const ownerString = getUserString(owner.user);
    const guildString = getGuildString(guild);
    clientLog.info(`Removed from ${guildString} owned by ${guildString}.`);

    // Send a message to DISCORD_DEV_CHANNEL_ID if set.
    if (env.DISCORD_DEV_CHANNEL_ID && env.DISCORD_DEV_GUILD_ID) {
      // Gets the channel.
      const channel = await client.channels.fetch(env.DISCORD_DEV_CHANNEL_ID);
      if (!channel || channel.type !== ChannelType.GuildText) {
        return;
      }

      // Creates the embed.
      const embed = new EmbedBuilder()
        .setTitle(`❌ Removed from ${guild.name || "Unknown Guild"}`)
        .setColor(HibikiColors.Success)
        .addFields(
          {
            name: "ID",
            value: guild.id,
            inline: false,
          },
          {
            name: "Created at",
            value: time(guild.createdAt, TimestampStyles.ShortDateTime),
            inline: false,
          },
        )
        .setImage(guild.bannerURL())
        .setThumbnail(guild.iconURL());

      // Owner.
      embed.addFields({
        name: "Owner",
        value: ownerString,
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
