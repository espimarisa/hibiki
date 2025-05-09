/**
 * @file Performs CRUD operations for Starboard data.
 * @license Zlib
 */

import { db } from "@/db/index.ts";
import { NOT_FOUND, redis, redisKeys, TTL } from "@/db/redis.ts";
import {
  type StarboardEntry,
  starboard_entries,
  starboard_reactions,
} from "@/db/schema/starboard.ts";
import { captureError, parseError } from "@/utils/error.ts";
import { dbLog, redisLog } from "@/utils/logger.ts";
import { and, count, eq } from "drizzle-orm";

/**
 * Checks if a user has already starred a message.
 * @param messageID The ID of the message.
 * @param userID The ID of the user.
 * @returns Boolean indicating if a user has starred a message.
 */

export async function hasUserStarred(messageID: string, userID: string) {
  const cacheKey = redisKeys.star_user(messageID, userID);

  try {
    // Searches the cache for star data.
    const cached = await redis.exists(cacheKey);
    if (cached) {
      redisLog.debug(`Star from user ${userID} on ${messageID} exists.`);
      return true;
    }

    // Searches the database for a user's star.
    const result = await db
      .select({ count: count() })
      .from(starboard_reactions)
      .where(
        and(
          eq(starboard_reactions.message_id, messageID),
          eq(starboard_reactions.user_id, userID),
        ),
      )
      .limit(1);

    // Return false if no result is found.
    if (!result[0]?.count) {
      return false;
    }

    // Checks to see if the count exists.
    const exists = result[0]?.count > 0;
    if (exists) {
      // Caches and returns the user's reaction.
      await redis.set(cacheKey, "1", "EX", TTL.Hour);
      redisLog.debug(`Updated star from user ${userID} on ${messageID}.`);
      return true;
    }

    return false;
  } catch (err) {
    const error = parseError(err);
    dbLog.error(
      `Error getting star from user ${userID} on message ${messageID}: ${error.message}`,
    );

    captureError(error, { messageID: messageID, userID: userID });
    return false;
  }
}

/**
 * Adds a star reaction record to the database.
 * @param message The ID of the message.
 * @param userID The ID of the user.
 * @returns The updated star count, or -1 if an error.
 */

export async function addStarReaction(messageID: string, userID: string) {
  const countCacheKey = redisKeys.star_count(messageID);
  const userCacheKey = redisKeys.star_user(messageID, userID);
  let count = 0;

  try {
    // Inserts the updated data into the database.
    await db
      .insert(starboard_reactions)
      .values({ message_id: messageID, user_id: userID })
      .onConflictDoNothing();

    // Updates the cache atomically.
    dbLog.debug(`Added star from user ${userID} on message ${messageID}.`);
    count = await redis.incr(countCacheKey);

    // Updates the TTL of the star.
    await redis.expire(countCacheKey, TTL.Hour);
    await redis.set(userCacheKey, "1", "EX", TTL.Hour);

    // Returns the star count.
    redisLog.debug(`Set star count for message ${messageID} to ${count}.`);
    return count;
  } catch (err) {
    const error = parseError(err);
    dbLog.error(
      `Error adding star from user ${userID} on message ${messageID}: ${error.message}`,
    );

    captureError(error, { messageID: messageID, userID: userID });
    return -1;
  }
}

/**
 * Removes a user's starred reaction.
 * @param message The ID of the starred message.
 * @param userID The ID of the user.
 * @returns The updated star count, or -1 if an error.
 */

export async function removeStarReaction(messageID: string, userID: string) {
  const countCacheKey = redisKeys.star_count(messageID);
  const userCacheKey = redisKeys.star_user(messageID, userID);
  let count = 0;
  let updated = false;

  try {
    // Gets the data from the database.
    const result = await db
      .delete(starboard_reactions)
      .where(
        and(
          eq(starboard_reactions.message_id, messageID),
          eq(starboard_reactions.user_id, userID),
        ),
      )
      .returning({ user_id: starboard_reactions.user_id });

    // Checks to see if the data has been updated.
    updated = result.length > 0;

    // Updates the cache.
    if (updated) {
      // Decrements the counter and deletes the user's cached data.
      count = await redis.decr(countCacheKey);
      await redis.del(userCacheKey);

      // Deletes empty reactions from the cache.
      if (count <= 0) {
        count = 0;
        await redis.del(countCacheKey);
        redisLog.debug(`Deleted star data for message ${messageID}.`);
      } else {
        // Updates the TTL of the cached item.
        await redis.expire(countCacheKey, TTL.Hour);
        redisLog.debug(`Decremented star count for message ${messageID}.`);
      }

      return count;
    }

    // If nothing changed, get the current count.
    return getStarCount(messageID);
  } catch (err) {
    const error = parseError(err);
    dbLog.error(
      `Error removing star by user ${userID} on message ${messageID}: ${error.message}`,
    );

    captureError(error, { messageId: messageID, userId: userID });
    return -1;
  }
}

/**
 * Gets the current star count for a message.
 * @param message The ID of the message.
 * @returns The total star count
 */

export async function getStarCount(messageID: string) {
  const cacheKey = redisKeys.star_count(messageID);

  try {
    // Checks to see if the star count is cached.
    const cache = await redis.get(cacheKey);
    if (cache) {
      redisLog.debug(`Got star count for message ${messageID}.`);
      return Number.parseInt(cache, 10);
    }

    // Gets data from the database.
    const result = await db
      .select({ value: count() })
      .from(starboard_reactions)
      .where(eq(starboard_reactions.message_id, messageID));

    // Checks to see if the value exists.
    if (!result[0]?.value) {
      dbLog.debug(`No star data found for message ${messageID}.`);
      return 0;
    }

    // Caches and returns the current star count.
    await redis.set(cacheKey, result[0].value.toString(), "EX", TTL.Hour);
    dbLog.debug(`Got star count for message ${messageID}.`);
    return result[0].value;
  } catch (err) {
    const error = parseError(err);
    dbLog.error(
      `Error getting star count for message ${messageID}: ${error.message}`,
    );

    captureError(error, { messageID: messageID });
    return 0;
  }
}

/**
 * Gets the starboard entry associated with a message ID.
 * @param message The ID of the original message.
 * @returns A StarboardEntry.
 */

export async function getStarboardEntry(messageID: string) {
  const cacheKey = redisKeys.star_entry(messageID);
  let entry: StarboardEntry;

  try {
    // Checks the cache for the data.
    const cached = await redis.get(cacheKey);

    if (cached) {
      // Checks to see if the data is set as explicitly not found.
      if (cached === NOT_FOUND) {
        redisLog.debug(
          `Starboard entry for message ${messageID} is in the NOT_FOUND status.`,
        );

        return;
      }

      // Attempts to parse the data.
      entry = JSON.parse(cached);

      // Validates the data to ensure IDs match.
      if (entry?.message_id !== messageID) {
        redisLog.warn(
          `Starboard entry for message ${messageID} has mismatched message_id (${entry?.message_id}).`,
        );

        // Destroys the invalid cache data.
        await redis.del(cacheKey);
        return;
      }

      // Returns the cached entry.
      redisLog.debug(`Got starboard entry for message ${messageID}.`);
      return entry;
    }

    // Checks for data in the database.
    redisLog.debug(`Starboard entry for message ${messageID} is not cached.`);
    const result = await db.query.starboard_entries.findFirst({
      where: eq(starboard_entries.message_id, messageID),
    });

    if (result) {
      // Caches the starboard entry and returns the data.
      dbLog.debug(`Got starboard entry for message ${messageID}.`);
      await redis.set(cacheKey, JSON.stringify(result), "EX", TTL.Hour);
      redisLog.debug(
        `Starboard entry for message ${messageID} has been cached.`,
      );

      return result;
    }

    // Sets the entry as not found.
    await redis.set(cacheKey, NOT_FOUND, "EX", TTL.NotFound);
    redisLog.debug(`Starboard entry ${messageID} set to NOT_FOUND.`);
    return;
  } catch (err) {
    const error = parseError(err);
    dbLog.error(
      `Error getting starboard entry for message ${messageID}: ${error.message}`,
    );

    captureError(error, { messageID: messageID });
    return;
  }
}

/**
 * Creates a new starboard entry in the database.
 * @param guildID The ID of the guild where the message is from.
 * @param messageID The ID of the message.
 * @param starID The ID of the message posted in the starboard channel.
 * @returns A starboard entry.
 */

export async function createStarboardEntry(
  guildID: string,
  messageID: string,
  starID: string,
) {
  const cacheKey = redisKeys.star_entry(messageID);
  const entryData = {
    guild_id: guildID,
    message_id: messageID,
    starboard_message_id: starID,
  };

  try {
    // Updates the star data.
    const result = await db
      .insert(starboard_entries)
      .values(entryData)
      .onConflictDoUpdate({
        target: starboard_entries.message_id,
        set: { starboard_message_id: starID },
      })
      .returning();

    // Gets the entry data.
    const starEntry = result[0];
    if (!starEntry) {
      dbLog.error(`Upsert operation for starred message ${starID} failed.`);
      return;
    }

    // Updates the cache.
    await redis.set(cacheKey, JSON.stringify(starEntry), "EX", TTL.Hour);
    redisLog.debug(`Cached starboard entry for message ${messageID}.`);

    // Returns the updated starboard entry.
    dbLog.debug(`Updated starboard entry for message ${messageID}.`);
    return starEntry;
  } catch (err) {
    const error = parseError(err);
    dbLog.error(
      `Error updating starboard entry for message ${messageID}: ${error.message}`,
    );

    captureError(error, { entryData });
    return;
  }
}

/**
 * Deletes a starboard entry from the database.
 * @param message The ID of the original message.
 * @returns A boolean indicating success or failure.
 */

export async function deleteStarboardEntry(messageID: string) {
  const cacheKey = redisKeys.star_entry(messageID);

  try {
    // Deletes the data from the database.
    const result = await db
      .delete(starboard_entries)
      .where(eq(starboard_entries.message_id, messageID))
      .returning({ deleted: starboard_entries.message_id });

    if (result.length > 0) {
      dbLog.debug(`Deleted starboard entry for message ${messageID}.`);
    }

    // Invalidates the cached data.
    await redis.del(cacheKey);
    redisLog.debug(`Deleted starboard entry for message ${messageID}.`);
    return true;
  } catch (err) {
    const error = parseError(err);
    dbLog.error(
      `Error deleting starboard entry for message ${messageID}: ${error.message}`,
    );

    captureError(error, { messageID: messageID });
    return false;
  }
}
