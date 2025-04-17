/**
 * @file Database schema for guild configs.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { pgTable, text, uuid } from "drizzle-orm/pg-core";

/** Database schema for a valid guild config. */
export const guildConfig = pgTable("guild_config", {
  // PostgreSQL's primary ID key.
  id: uuid("id").primaryKey().defaultRandom(),

  // The guild's Discord guild ID.
  guild_id: text("guild_id").notNull(),
});
