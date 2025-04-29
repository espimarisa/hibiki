/**
 * @file Drizzle database schema for Hibiki guild configurations.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { sql } from "drizzle-orm";
import { check, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

/** Database schema for a valid guild config. */
export const guildConfig = pgTable(
  "guild_config",
  {
    // PostgreSQL's primary ID key.
    id: uuid("id").defaultRandom().primaryKey(),

    // The guild's unique Discord guild ID.
    guild_id: text("guild_id").notNull(),

    // The amount of reactions needed before a message can be starred
    starboard_count: integer("star_amount"),

    // The channel ID to send starboard reactions into
    starboard_channel: text("starboard_channel"),
  },
  (table) => [
    // Validates starboard_count to be >= 0 if it exists
    check("starboard_count not <= 0", sql`${table.starboard_count} > 0`),
  ],
);

/** Typing for a valid Hibiki guild config. */
export type HibikiGuildConfig = typeof guildConfig.$inferSelect;
