/**
 * @file Guild configuration database schema.
 * @license Zlib
 */

import { DISCORD_SNOWFLAKE_STRING_REGEX } from "@/utils/constants.ts";
import { sql } from "drizzle-orm";
import {
  check,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// Create a reusable sql fragment containing the raw pattern string
const DISCORD_SNOWFLAKE_SQL_RAW = sql.raw(DISCORD_SNOWFLAKE_STRING_REGEX);

export const guild_config = pgTable(
  "guild_config",
  {
    // The guild's Discord guild ID.
    guild_id: text("guild_id").notNull(),

    // Primary key identifier.
    id: uuid("id").defaultRandom().primaryKey(),

    // The Discord channel ID of a guild's preferred starboard channel.
    starboard_channel: text("starboard_channel"),

    // The amount of star reactions needed before sending a message to the starboard.
    starboard_count: integer("starboard_count"),
  },
  (table) => [
    // CHECK constraint: Validates guild_id matches the Discord Snowflake pattern.
    check(
      "guild_config_guild_id_snowflake_check",
      sql`${table.guild_id} ~ '${DISCORD_SNOWFLAKE_SQL_RAW}'`,
    ),

    // CHECK constraint: Validates starboard_channel is either NULL or matches the Snowflake pattern.
    check(
      "guild_config_starboard_channel_snowflake_check",
      sql`(${table.starboard_channel} IS NULL OR ${table.starboard_channel} ~ '${DISCORD_SNOWFLAKE_SQL_RAW}')`,
    ),

    // CHECK constraint: Validates starboard_count is either NULL or greater than 0.
    check(
      "guild_config_starboard_count_positive_check",
      sql`(${table.starboard_count} IS NULL OR ${table.starboard_count} > 0)`,
    ),

    // UNIQUE index: Ensures guild_id is unique across all rows in this table.
    uniqueIndex("guild_config_guild_id_index").on(table.guild_id),
  ],
);

export type GuildConfig = typeof guild_config.$inferSelect;
