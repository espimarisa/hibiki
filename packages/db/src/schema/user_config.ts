import { uuid, text, pgTable } from "drizzle-orm/pg-core";

export const userConfig = pgTable("user_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id").notNull(),
  locale: text("locale"),
});
