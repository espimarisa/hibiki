/**
 * @file Drizzle database schema for Hibiki user configurations.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { pgTable, text, uuid } from "drizzle-orm/pg-core";

/** Database schema for a valid user config. */
export const userConfig = pgTable("user_config", {
  // PostgreSQL's primary ID key.
  id: uuid("id").primaryKey().defaultRandom(),

  // The user's unique Discord user ID.
  user_id: text("user_id").notNull(),
});

/** Typing for a valid Hibiki user config. */
export type HibikiUserConfig = typeof userConfig.$inferSelect;
