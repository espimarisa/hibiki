/**
 * @file Helpers to interact with Discord or Discord.js directly.
 * @license Zlib
 */

import { captureError, parseError } from "@/utils/error.ts";
import { clientLog, sharderLog } from "@/utils/logger.ts";
import {
  type Client,
  type Guild,
  type PartialUser,
  type ShardingManager,
  TextChannel,
  type User,
} from "discord.js";

// Error message for when a text channel fails to validate.
const textChannelFail = "failing text channel validation.";

/**
 * Returns a formatted username/userID string.
 * @param user The user object to parse.
 */

export function getUserString(user: User | PartialUser) {
  return `${user?.username || "Unknown User"}/${user?.id || "Unknown ID"}`;
}

/**
 * Returns a formatted guild/guildID string.
 * @param guild The guild object to parse.
 */

export function getGuildString(guild: Guild) {
  return `${guild?.name || "Unknown Guild"}/${guild?.id || "Unknown ID"}`;
}

/**
 * Gets and validates a guild text channel.
 * @param client A Discord.js client instance.
 * @param channelID The ID of the channel to validate.
 * @returns A text channel object, if valid.
 */

export async function getValidTextChannel(
  client: Client<true>,
  channelID: string,
) {
  try {
    // Fetches the channel.
    clientLog.debug(`Validating text channel ${channelID}.`);
    const channel = await client.channels.fetch(channelID);

    // Ensures that the channel exists.
    if (!channel) {
      clientLog.warn(`Failed to fetch channel ${channelID}.`);
      return;
    }

    // Ensures that the channel is a text channel.
    if (!(channel instanceof TextChannel)) {
      clientLog.warn(
        `Channel ${channelID} is not a text channel, ${textChannelFail}.`,
      );

      return;
    }

    // Gets permissions of the channel.
    const permissions = channel.permissionsFor(client.user.id);
    if (!permissions) {
      clientLog.debug(
        `No permissions object found for channel ${channelID}, ${textChannelFail}.`,
      );

      return;
    }

    // Ensures the client has SEND_MESSAGES.
    if (!permissions.has("SendMessages")) {
      clientLog.debug(
        `Lacking SEND_MESSAGES permission for channel ${channelID}, ${textChannelFail}.`,
      );

      return;
    }

    // Ensures the client has EMBED_LINKS.
    if (!permissions.has("EmbedLinks")) {
      clientLog.debug(
        `Lacking EMBED_LINKS permission for channel ${channelID}, ${textChannelFail}.`,
      );

      return;
    }

    // Ensures the client has READ_MESSAGE_HISTORY.
    if (!permissions.has("ReadMessageHistory")) {
      clientLog.debug(
        `Lacking READ_MESSAGE_HISTORY permission for channel ${channelID}, ${textChannelFail}.`,
      );

      return;
    }

    return channel;
  } catch (err) {
    const error = parseError(err);
    clientLog.warn(
      `Failed to fetch channel ${channelID}, ${textChannelFail}: ${error.message}`,
    );

    captureError(error, { channelID: channelID });
    return false;
  }
}

/**
 * Gets the total number of guilds across all shards.
 * @param sharder The sharding manager to use.
 * @returns The total number of guilds across all shards.
 */

export async function getTotalGuilds(sharder: ShardingManager) {
  sharderLog.debug("Calculating total number of guilds.");

  const results = await sharder.broadcastEval((client) =>
    client.guilds.fetch().then((guilds) => guilds.size),
  );

  return results.reduce((acc, count) => acc + count, 0);
}

/**
 * Gets the total number of cached guilds across all shards.
 * @param sharder The sharding manager to use.
 * @returns The total number of cached guilds across all shards.
 */

export async function getTotalCachedGuilds(sharder: ShardingManager) {
  sharderLog.debug("Calculating total number of cached guilds.");

  const total = (await sharder.fetchClientValues(
    "guilds.cache.size",
  )) as number[];

  if (total.length === 0) {
    return;
  }

  return total.reduce((a, b) => a + b);
}

/**
 * Gets the total number of cached users across all guilds.
 * @param sharder The sharding manager to use.
 * @returns The total number of cached users across all guilds.
 */

export async function getTotalCachedUsers(sharder: ShardingManager) {
  sharderLog.debug("Calculating total number of cached users.");

  const total = (await sharder.fetchClientValues(
    "users.cache.size",
  )) as number[];

  if (total.length === 0) {
    return;
  }

  return total.reduce((a, b) => a + b);
}
