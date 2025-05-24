/**
 * @file Event handler for guildDelete.
 * @license zlib
 */

import { client } from "@/root/client.js";
import { HibikiColors } from "@/utils/constants.js";
import { env } from "@/utils/env.js";
import { getGuildString, getUserString } from "@/utils/format.js";
import { clientLog } from "@/utils/logger.js";
import { ChannelType, TimestampStyles, time } from "discord.js";

export const guildDelete: HibikiListener<"guildDelete"> = {
  event: "guildDelete",

  handle: async (guild) => {
    // Gets the guild owner and name.
    const owner = await guild.fetchOwner();
    const ownerString = getUserString(owner.user);
    const guildString = getGuildString(guild);
    clientLog.info(`Removed from ${guildString} owned by ${ownerString}.`);

    // Send a message to DISCORD_DEV_CHANNEL_ID if set.
    if (env.DEV_CHANNEL_ID && env.DEV_GUILD_ID) {
      // Gets the channel.
      const channel = await client.channels.fetch(env.DEV_CHANNEL_ID);
      if (!channel || channel.type !== ChannelType.GuildText) {
        return;
      }

      // Logs to the logging channel.
      await channel.send({
        embeds: [
          {
            title: `❌ Removed from ${guild.name || "Unknown Guild"}`,
            color: HibikiColors.Error,
            image: {
              url: guild.bannerURL() || "",
            },
            thumbnail: {
              url: guild.iconURL() || "",
            },
            fields: [
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
              {
                name: "Owner",
                value: ownerString,
                inline: false,
              },
              {
                name: "Members",
                value: guild.memberCount
                  ? guild.memberCount.toString()
                  : "Unknown",
                inline: false,
              },
            ],
          },
        ],
      });
    }
  },
};
