/**
 * @file Helper utilities interacting with Discord or Discord.js.
 * @license zlib
 */

import { clientLog, sharderLog } from "@/utils/logger.js";
import { captureException } from "@sentry/bun";
import type {
  Client,
  Message,
  MessageReaction,
  PartialMessage,
  PartialMessageReaction,
  PartialUser,
  ShardingManager,
  User,
} from "discord.js";
import { TextChannel } from "discord.js";

const DISCORD_NAME_REGEX = /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;

/**
 * Validates a command/option name against Discord's requirements.
 * @param content The text content of the name to validate against Discord's requirements.
 * @returns A boolean indicating validity.
 */

export function isValidName(content: string) {
  return DISCORD_NAME_REGEX.test(content);
}

/**
 * Validates a command/option name against Discord's requirements.
 * @param content The text content of the description to validate against Discord's requirements.
 * @returns A boolean indicating validity.
 */

export function isValidDescription(content: string) {
  return content.length > 0 && content.length <= 100;
}

/**
 * Gets and validates a guild text channel.
 * @param client A ready Discord.js client instance.
 * @param id The ID of the channel to validate.
 * @returns A validated text channel object or undefined if validation fails.
 */

export async function getTextChannel(client: Client<true>, id: string) {
  try {
    // Fetches the channel.
    clientLog.debug(`Validating text channel ${id}.`);
    const channel = await client.channels.fetch(id);

    // Ensures that the channel exists.
    if (!channel) {
      clientLog.warn(`Failed to fetch text channel ${id}.`);
      return;
    }

    // Ensures that the channel is a text channel.
    if (!(channel instanceof TextChannel)) {
      clientLog.debug(`Channel ${id} is not a text channel.`);
      return;
    }

    // Gets permissions of the channel.
    const permissions = channel.permissionsFor(client.user.id);
    if (!permissions) {
      clientLog.debug(`No permissions object found for text channel ${id}.`);
      return;
    }

    // Ensures the client has SEND_MESSAGES.
    if (!permissions.has("SendMessages")) {
      clientLog.debug(`Lacking SEND_MESSAGES in text channel ${id}.`);
      return;
    }

    // Ensures the client has EMBED_LINKS.
    if (!permissions.has("EmbedLinks")) {
      clientLog.debug(`Lacking EMBED_LINKS in text channel ${id}.`);
      return;
    }

    // Ensures the client has READ_MESSAGE_HISTORY.
    if (!permissions.has("ReadMessageHistory")) {
      clientLog.debug(`Lacking READ_MESSAGE_HISTORY in text channel ${id}.`);
      return;
    }

    return channel;
  } catch (err) {
    clientLog.warn(err, `Failed fetching text channel ${id}.`);
    captureException(err, { extra: { channelID: id } });
    return;
  }
}

/**
 * Fetches the full object from a partial message.
 * @param message The partial message object to resolve.
 * @returns A promise resolving to a fully fetched message object or undefined if it failed to fetch.
 */

export async function resolvePartialMessage(
  message: PartialMessage | Message | undefined,
) {
  // Do not process non-partials further.
  if (!message?.partial) {
    return message;
  }

  try {
    // Fetches the full object.
    const resolved = await message.fetch();

    // Return undefined if it is a partial still for further checking.
    if (!resolved || resolved.partial) {
      clientLog.warn(`Failed fetching message ${message.id} from partial.`);
      return;
    }

    // Returns the resolved object.
    return resolved;
  } catch (err) {
    clientLog.error(err, "Failed fetching full message from partial.");
    captureException(err, { extra: { messageID: message.id } });
    return;
  }
}

/**
 * Fetches the full object from a partial reaction.
 * @param reaction The partial reaction object to resolve.
 * @returns A promise resolving to a fully fetched reaction object or undefined if it failed to fetch.
 */

export async function resolvePartialReaction(
  reaction: PartialMessageReaction | MessageReaction | undefined,
) {
  // Do not process non-partials further.
  if (!reaction?.partial) {
    return reaction;
  }

  try {
    // Fetches the full object.
    const resolved = await reaction.fetch();

    // Return undefined if it is a partial still for further checking.
    if (!resolved || resolved.partial) {
      clientLog.warn("Failed fetching reaction from partial.");
      return;
    }

    // Returns the resolved object.
    return resolved;
  } catch (err) {
    clientLog.error(
      err,
      `Failed fetching full reaction on ${reaction.message.id} from partial.`,
    );

    captureException(err, { extra: { messageID: reaction.message.id } });
    return;
  }
}

/**
 * Fetches the full object from a partial user.
 * @param user The partial user object to resolve.
 * @returns A promise resolving to a fully fetched user object or undefined if it failed to fetch.
 */

export async function resolvePartialUser(user: PartialUser | User | undefined) {
  // Do not process non-partials further.
  if (!user?.partial) {
    return user;
  }

  try {
    // Fetches the full object.
    const resolved = await user.fetch();

    // Return undefined if it is a partial still for further checking.
    if (!resolved || resolved.partial) {
      clientLog.warn(`Failed fetching user ${user.id} from partial.`);
      return;
    }

    // Returns the resolved object.
    return resolved;
  } catch (err) {
    clientLog.error(err, `Failed fetching user ${user.id} from partial.`);
    captureException(err, { extra: { userID: user.id } });
    return;
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
    return 0;
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
    return 0;
  }

  return total.reduce((a, b) => a + b);
}
