/**
 * @file PostgreSQL schema for user configs.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { pgTable, text, uuid } from "drizzle-orm/pg-core";

/** Database schema for a valid user config. */
export const userConfig = pgTable("user_config", {
  /** PostgreSQL UUID primary key. */
  id: uuid("id").primaryKey().defaultRandom(),

  /** User ID of the user. */
  user_id: text("user_id").notNull(),
});
