/**
 * @file Drizzle database schema for user configurations.
 * @license zlib
 */

import { DISCORD_SNOWFLAKE_REGEX_SQL } from "@/db/constants.ts";
import { sql } from "drizzle-orm";
import { check, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";

// Creates the user configuration schema.
export const user_config = pgTable(
  "user_config",
  {
    // Primary key identifier.
    id: uuid("id").primaryKey().defaultRandom(),

    // The user's Discord user ID.
    user_id: text("user_id").notNull(),
  },
  (table) => [
    // Validates user_id, ensuring that it is a snowflake.
    check(
      "user_config_user_id_snowflake_check",
      sql`${table.user_id} ~ '${DISCORD_SNOWFLAKE_REGEX_SQL}'`,
    ),

    // Ensures user_id is unique across all configurations.
    uniqueIndex("user_config_user_id_index").on(table.user_id),
  ],
);

// Typing for a valid user configuration.
export type UserConfig = typeof user_config.$inferSelect;
