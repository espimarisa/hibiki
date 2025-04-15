/**
 * @file PostgreSQL schema for guild configs.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { pgTable, text, uuid } from "drizzle-orm/pg-core";

/** Database schema for a valid guild config. */
export const guildConfig = pgTable("guild_config", {
  /** PostgreSQL UUID primary key. */
  id: uuid("id").primaryKey().defaultRandom(),

  /** Guild ID of the guild. */
  guild_id: text("guild_id").notNull(),
});
