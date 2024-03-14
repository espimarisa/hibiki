import { uuid, text, pgTable } from "drizzle-orm/pg-core";

export const guildConfig = pgTable("guild_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  guild_id: text("guild_id").notNull(),
});
