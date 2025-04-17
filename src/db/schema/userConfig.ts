/**
 * @file Database schema for user configs.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { pgTable, text, uuid } from "drizzle-orm/pg-core";

/** Database schema for a valid user config. */
export const userConfig = pgTable("user_config", {
  // PostgreSQL's primary ID key.
  id: uuid("id").primaryKey().defaultRandom(),

  // The user's Discord user ID.
  user_id: text("user_id").notNull(),
});
