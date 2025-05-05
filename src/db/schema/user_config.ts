/**
 * @file User configuration database schema.
 * @license Zlib
 */

import { DISCORD_SNOWFLAKE_STRING_REGEX } from "@/utils/constants.ts";
import { sql } from "drizzle-orm";
import { check, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";

// Create a reusable sql fragment containing the raw pattern string
const DISCORD_SNOWFLAKE_SQL_RAW = sql.raw(DISCORD_SNOWFLAKE_STRING_REGEX);

export const user_config = pgTable(
  "user_config",
  {
    // Primary key identifier.
    id: uuid("id").primaryKey().defaultRandom(),

    // The user's Discord user ID.
    user_id: text("user_id").notNull(),
  },
  (table) => [
    // CHECK constraint: Validates user_id matches the Discord Snowflake pattern.
    check(
      "user_config_user_id_snowflake_check",
      sql`${table.user_id} ~ '${DISCORD_SNOWFLAKE_SQL_RAW}'`,
    ),

    // Ensures user_id is unique across all configurations.
    uniqueIndex("user_config_user_id_index").on(table.user_id),
  ],
);

export type UserConfig = typeof user_config.$inferSelect;
