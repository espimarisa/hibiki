CREATE TABLE "guild_config" (
	"guild_id" text NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"starboard_channel" text,
	"starboard_count" integer,
	CONSTRAINT "guild_config_guild_id_snowflake_check" CHECK ("guild_config"."guild_id" ~ '^\d{17,20}$'),
	CONSTRAINT "guild_config_starboard_channel_snowflake_check" CHECK (("guild_config"."starboard_channel" IS NULL OR "guild_config"."starboard_channel" ~ '^\d{17,20}$')),
	CONSTRAINT "guild_config_starboard_count_positive_check" CHECK (("guild_config"."starboard_count" IS NULL OR "guild_config"."starboard_count" > 0))
);
--> statement-breakpoint
CREATE TABLE "starboard_entries" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"guild_id" text NOT NULL,
	"message_id" text PRIMARY KEY NOT NULL,
	"starboard_message_id" text NOT NULL,
	CONSTRAINT "starboard_entries_starboard_message_id_unique" UNIQUE("starboard_message_id"),
	CONSTRAINT "starboard_entries_guild_id_snowflake_check" CHECK ("starboard_entries"."guild_id" ~ '^\d{17,20}$'),
	CONSTRAINT "starboard_entries_message_id_snowflake_check" CHECK ("starboard_entries"."message_id" ~ '^\d{17,20}$'),
	CONSTRAINT "starboard_entries_starboard_message_id_snowflake_check" CHECK ("starboard_entries"."starboard_message_id" ~ '^\d{17,20}$')
);
--> statement-breakpoint
CREATE TABLE "starboard_reactions" (
	"message_id" text NOT NULL,
	"starred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "starboard_reactions_pk" PRIMARY KEY("message_id","user_id"),
	CONSTRAINT "starboard_reactions_message_id_snowflake_check" CHECK ("starboard_reactions"."message_id" ~ '^\d{17,20}$'),
	CONSTRAINT "starboard_reactions_user_id_snowflake_check" CHECK ("starboard_reactions"."user_id" ~ '^\d{17,20}$')
);
--> statement-breakpoint
CREATE TABLE "user_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "user_config_user_id_snowflake_check" CHECK ("user_config"."user_id" ~ '^\d{17,20}$')
);
--> statement-breakpoint
CREATE UNIQUE INDEX "guild_config_guild_id_index" ON "guild_config" USING btree ("guild_id");--> statement-breakpoint
CREATE INDEX "starboard_entries_guild_id_index" ON "starboard_entries" USING btree ("guild_id");--> statement-breakpoint
CREATE INDEX "starboard_reactions_message_id_index" ON "starboard_reactions" USING btree ("message_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_config_user_id_index" ON "user_config" USING btree ("user_id");
