/**
 * @file Performs database operations for starboard data.
 * @license zlib
 */

import { captureException } from "@sentry/bun";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/db/index.ts";
import type { StarboardEntry } from "@/db/schema/starboard.ts";
import {
  starboard_entries,
  starboard_reactions,
} from "@/db/schema/starboard.ts";
import { NOT_FOUND, TTL, valkey, valkeyKeys } from "@/db/valkey";
import { dbLog, valkeyLog } from "@/utils/logger.ts";

/**
 * Checks if a user has already starred a message.
 * @param messageID The message ID of the message to check.
 * @param userID The user ID of the user.
 * @returns A promise resolving to a boolean indicating true or false.
 */

export async function hasUserStarred(messageID: string, userID: string) {
  const cacheKey = valkeyKeys.star_user(messageID, userID);

  try {
    // Searches the cache for star data.
    const cached = await valkey.exists(cacheKey);
    if (cached) {
      valkeyLog.debug(`Got star_user data from ${userID} on ${messageID}.`);
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
      valkeyLog.debug(`No star_user data from ${userID} on ${messageID}.`);
      return false;
    }

    // Checks to see if the count exists.
    const exists = result[0]?.count > 0;
    if (exists) {
      // Caches and returns the user's reaction.
      await valkey.set(cacheKey, "1", "EX", TTL.Hour);
      valkeyLog.debug(`Updated star_user data for ${userID} on ${messageID}.`);
      return true;
    }

    return false;
  } catch (err) {
    dbLog.error(
      err,
      `Error getting star_user data from ${userID} on ${messageID}.`,
    );

    captureException(err, { extra: { messageID: messageID, userID: userID } });
    return false;
  }
}

/**
 * Adds a star reaction to the database.
 * @param message The ID of the message.
 * @param userID The ID of the user.
 * @returns A promise resolving to the updated star count or -1 on error.
 */

export async function addStarReaction(messageID: string, userID: string) {
  const countCacheKey = valkeyKeys.star_count(messageID);
  const userCacheKey = valkeyKeys.star_user(messageID, userID);
  let starCount = 0;

  try {
    // Inserts the updated data into the database.
    await db
      .insert(starboard_reactions)
      .values({ message_id: messageID, user_id: userID })
      .onConflictDoNothing();

    // Updates the cache atomically.
    dbLog.debug(`Added star_count data from ${userID} to ${messageID}.`);
    starCount = await valkey.incr(countCacheKey);

    // Updates the TTL of the star.
    await valkey.expire(countCacheKey, TTL.Hour);
    await valkey.set(userCacheKey, "1", "EX", TTL.Hour);

    // Returns the star count.
    valkeyLog.debug(`Set star_count for ${messageID} to ${starCount}.`);
    return starCount;
  } catch (err) {
    dbLog.error(err, `Error adding star from ${userID} on ${messageID}.`);
    captureException(err, { extra: { messageID: messageID, userID: userID } });
    return -1;
  }
}

/**
 * Removes a user's starred reaction from the database.
 * @param message The message ID of the starred message.
 * @param userID The user ID of the user.
 * @returns A promise resolving to the updated star count or -1 on error.
 */

export async function removeStarReaction(messageID: string, userID: string) {
  const countCacheKey = valkeyKeys.star_count(messageID);
  const userCacheKey = valkeyKeys.star_user(messageID, userID);
  let starCount = 0;
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
      starCount = await valkey.decr(countCacheKey);
      await valkey.del(userCacheKey);

      // Deletes empty reactions from the cache.
      if (starCount <= 0) {
        starCount = 0;
        await valkey.del(countCacheKey);
        valkeyLog.debug(`Deleted star_count by ${userID} on ${messageID}.`);
      } else {
        // Updates the TTL of the cached item.
        await valkey.expire(countCacheKey, TTL.Hour);
        valkeyLog.debug(`Reduced star_count for ${messageID}.`);
      }

      return starCount;
    }

    // If nothing changed, gets the current count as a fallback.
    return getStarCount(messageID);
  } catch (err) {
    dbLog.error(
      err,
      `Error removing star_user data for ${userID} on ${messageID}.`,
    );

    captureException(err, { extra: { messageID: messageID, userID: userID } });
    return -1;
  }
}

/**
 * Gets the current star count for a message.
 * @param messageID The ID of the message.
 * @returns A promise resolving to the current star count.
 */

export async function getStarCount(messageID: string) {
  const cacheKey = valkeyKeys.star_count(messageID);

  try {
    // Checks to see if the star count is cached.
    const cache = await valkey.get(cacheKey);
    if (cache) {
      valkeyLog.debug(`Got star_count for ${messageID}, is ${cache}.`);
      return Number.parseInt(cache, 10);
    }

    // Gets data from the database.
    const result = await db
      .select({ value: count() })
      .from(starboard_reactions)
      .where(eq(starboard_reactions.message_id, messageID));

    // Checks to see if the value exists.
    if (!result[0]?.value) {
      dbLog.debug(`No star_count data found for ${messageID}.`);
      return 0;
    }

    // Caches and returns the current star count.
    const starCount = result[0].value.toString();
    await valkey.set(cacheKey, starCount, "EX", TTL.Hour);
    dbLog.debug(`Got star_count data for ${messageID}, is ${starCount}.`);
    return result[0].value;
  } catch (err) {
    dbLog.error(err, `Error getting star_count for ${messageID}.`);
    captureException(err, { extra: { messageID: messageID } });
    return 0;
  }
}

/**
 * Gets the starboard entry associated with a message ID.
 * @param message The ID of the originally starred message.
 * @returns A promise resolving to a starboard entry object or undefined.
 */

export async function getStarboardEntry(messageID: string) {
  const cacheKey = valkeyKeys.star_entry(messageID);
  let entry: StarboardEntry;

  try {
    // Checks the cache for the data.
    const cached = await valkey.get(cacheKey);

    if (cached) {
      // Checks to see if the data is set as explicitly not found.
      if (cached === NOT_FOUND) {
        valkeyLog.debug(
          `star_entry data for ${messageID} is currently NOT_FOUND.`,
        );

        return;
      }

      // Attempts to parse the data.
      entry = JSON.parse(cached);

      // Validates the data to ensure IDs match.
      if (entry?.message_id !== messageID) {
        valkeyLog.warn(
          `star_entry data for ${messageID} has mismatched message_id ${entry?.message_id}.`,
        );

        // Destroys the invalid cache data.
        await valkey.del(cacheKey);
        return;
      }

      // Returns the cached entry.
      valkeyLog.debug(`Got star_entry data for ${messageID}.`);
      return entry;
    }

    // Checks for data in the database.
    const result = await db.query.starboard_entries.findFirst({
      where: eq(starboard_entries.message_id, messageID),
    });

    if (result) {
      // Caches the starboard entry and returns the data.
      dbLog.debug(`Got star_entry data for ${messageID}.`);
      await valkey.set(cacheKey, JSON.stringify(result), "EX", TTL.Hour);
      valkeyLog.debug(`Set star_entry data for ${messageID}.`);
      return result;
    }

    // Sets the entry as not found.
    await valkey.set(cacheKey, NOT_FOUND, "EX", TTL.NotFound);
    valkeyLog.debug(`star_entry data for ${messageID} set to NOT_FOUND.`);
    return;
  } catch (err) {
    dbLog.error(err, `Error getting star_entry data for ${messageID}.`);
    captureException(err, { extra: { messageID: messageID } });
    return;
  }
}

/**
 * Creates a new starboard entry in the database.
 * @param guildID The ID of the guild where the message is in.
 * @param messageID The ID of the message.
 * @param starID The ID of the starboard entry message.
 * @returns A promise resolving to a starboard entry or undefined.
 */

export async function createStarboardEntry(
  guildID: string,
  messageID: string,
  starID: string,
) {
  const cacheKey = valkeyKeys.star_entry(messageID);
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
      dbLog.error(`Upsert operation for star_entry ${starID} failed.`);
      return;
    }

    // Updates the cache and returns the updated entry.
    await valkey.set(cacheKey, JSON.stringify(starEntry), "EX", TTL.Hour);
    valkeyLog.debug(`Set star_entry for ${messageID}.`);
    dbLog.debug(`Updated star_entry for ${messageID}.`);
    return starEntry;
  } catch (err) {
    dbLog.error(err, `Error updating star_entry for ${messageID}.`);
    captureException(err, { extra: { entryData: entryData } });
    return;
  }
}

/**
 * Deletes a starboard entry from the database.
 * @param message The ID of the original message.
 * @returns A promise resolving to a boolean indicating success or failure.
 */

export async function deleteStarboardEntry(messageID: string) {
  const cacheKey = valkeyKeys.star_entry(messageID);

  try {
    // Deletes the data from the database.
    const result = await db
      .delete(starboard_entries)
      .where(eq(starboard_entries.message_id, messageID))
      .returning({ deleted: starboard_entries.message_id });

    if (result.length > 0) {
      dbLog.debug(`Deleted star_entry for ${messageID}.`);
    }

    // Invalidates the cached data.
    await valkey.del(cacheKey);
    valkeyLog.debug(`Deleted star_entry for ${messageID}.`);
    return true;
  } catch (err) {
    dbLog.error(err, `Error deleting star_entry for ${messageID}.`);
    captureException(err, { extra: { messageID: messageID } });
    return false;
  }
}
