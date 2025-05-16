/**
 * @file Drizzle database schema for starboard data.
 * @license zlib
 */

import { DISCORD_SNOWFLAKE_REGEX_SQL } from "@/db/constants.ts";
import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// Creates the starboard reaction data schema.
export const starboard_reactions = pgTable(
  "starboard_reactions",
  {
    // The Discord message ID of the message reacted to.
    message_id: text("message_id").notNull(),

    // Timestamp indicating when a reaction was added by a user.
    starred_at: timestamp("starred_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),

    // The Discord user ID of the reactor.
    user_id: text("user_id").notNull(),
  },
  (table) => [
    // Validates message_id, ensuring that it is a snowflake.
    check(
      "starboard_reactions_message_id_snowflake_check",
      sql`${table.message_id} ~ '${DISCORD_SNOWFLAKE_REGEX_SQL}'`,
    ),

    // Validates user_Id, ensuring that it is a snowflake.
    check(
      "starboard_reactions_user_id_snowflake_check",
      sql`${table.user_id} ~ '${DISCORD_SNOWFLAKE_REGEX_SQL}'`,
    ),

    // Message ID index.
    index("starboard_reactions_message_id_index").on(table.message_id),

    // Composite primary key to prevent a user from starring the same message multiple times.
    primaryKey({
      name: "starboard_reactions_pk",
      columns: [table.message_id, table.user_id],
    }),
  ],
);

// Creates the starboard entries schema.
export const starboard_entries = pgTable(
  "starboard_entries",
  {
    // Timestamp indicating when the starboard entry was created.
    created_at: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),

    // The Discord guild ID where the original message is located.
    guild_id: text("guild_id").notNull(),

    // The Discord message ID of the original message.
    message_id: text("message_id").primaryKey(),

    // The Discord message ID of the message posted on the starboard channel.
    starboard_message_id: text("starboard_message_id").notNull(),
  },
  (table) => [
    // Validates guild_id, ensuring that it is a snowflake.
    check(
      "starboard_entries_guild_id_snowflake_check",
      sql`${table.guild_id} ~ '${DISCORD_SNOWFLAKE_REGEX_SQL}'`,
    ),

    // Validates message_id, ensuring that it is a snowflake.
    check(
      "starboard_entries_message_id_snowflake_check",
      sql`${table.message_id} ~ '${DISCORD_SNOWFLAKE_REGEX_SQL}'`,
    ),

    // Validates starboard_message_id, ensuring that it is a snowflake.
    check(
      "starboard_entries_starboard_message_id_snowflake_check",
      sql`${table.starboard_message_id} ~ '${DISCORD_SNOWFLAKE_REGEX_SQL}'`,
    ),

    // Constraint for starboard_message_id.
    unique("starboard_entries_starboard_message_id_unique").on(
      table.starboard_message_id,
    ),

    // Guild ID index.
    index("starboard_entries_guild_id_index").on(table.guild_id),
  ],
);

// Defines relations between starboard_reactions and starboard_entries.
export const starboard_reactions_relations = relations(
  starboard_reactions,
  ({ one }) => ({
    message: one(starboard_entries, {
      fields: [starboard_reactions.message_id],
      references: [starboard_entries.message_id],
    }),
  }),
);

// Defines relations between starboard_entries and starboard_reactions.
export const starboard_entries_relations = relations(
  starboard_entries,
  ({ many }) => ({
    stars: many(starboard_reactions),
  }),
);

// Typing for valid starboard reaction data.
export type StarboardReaction = typeof starboard_reactions.$inferSelect;

// Typing for valid starboard entry.
export type StarboardEntry = typeof starboard_entries.$inferSelect;
