/**
 * @file User configuration database schema.
 * @license Zlib
 */

import { DISCORD_SNOWFLAKE_REGEX } from "@/utils/constants.ts";
import { sql } from "drizzle-orm";
import { check, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";

const DISCORD_SNOWFLAKE = sql.raw(DISCORD_SNOWFLAKE_REGEX);

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
      sql`${table.user_id} ~ '${DISCORD_SNOWFLAKE}'`,
    ),

    // Ensures user_id is unique across all configurations.
    uniqueIndex("user_config_user_id_index").on(table.user_id),
  ],
);

export type UserConfig = typeof user_config.$inferSelect;
