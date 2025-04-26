/**
 * @file Drizzle database schema for Hibiki guild configurations.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { pgTable, text, uuid } from "drizzle-orm/pg-core";

/** Database schema for a valid guild config. */
export const guildConfig = pgTable("guild_config", {
  // PostgreSQL's primary ID key.
  id: uuid("id").primaryKey().defaultRandom(),

  // The guild's unique Discord guild ID.
  guild_id: text("guild_id").notNull(),
});
