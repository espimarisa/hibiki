ALTER TABLE "guild_config" DROP CONSTRAINT "guild_config_guild_id_snowflake_check";--> statement-breakpoint
ALTER TABLE "guild_config" DROP CONSTRAINT "guild_config_starboard_channel_snowflake_check";--> statement-breakpoint
ALTER TABLE "starboard_entries" DROP CONSTRAINT "starboard_entries_guild_id_snowflake_check";--> statement-breakpoint
ALTER TABLE "starboard_entries" DROP CONSTRAINT "starboard_entries_message_id_snowflake_check";--> statement-breakpoint
ALTER TABLE "starboard_entries" DROP CONSTRAINT "starboard_entries_starboard_message_id_snowflake_check";--> statement-breakpoint
ALTER TABLE "starboard_reactions" DROP CONSTRAINT "starboard_reactions_message_id_snowflake_check";--> statement-breakpoint
ALTER TABLE "starboard_reactions" DROP CONSTRAINT "starboard_reactions_user_id_snowflake_check";--> statement-breakpoint
ALTER TABLE "user_config" DROP CONSTRAINT "user_config_user_id_snowflake_check";--> statement-breakpoint
ALTER TABLE "guild_config" ADD CONSTRAINT "guild_config_guild_id_snowflake_check" CHECK ("guild_config"."guild_id" ~ '^(?<id>\d{17,20})$');--> statement-breakpoint
ALTER TABLE "guild_config" ADD CONSTRAINT "guild_config_starboard_channel_snowflake_check" CHECK (("guild_config"."starboard_channel" IS NULL OR "guild_config"."starboard_channel" ~ '^(?<id>\d{17,20})$'));--> statement-breakpoint
ALTER TABLE "starboard_entries" ADD CONSTRAINT "starboard_entries_guild_id_snowflake_check" CHECK ("starboard_entries"."guild_id" ~ '^(?<id>\d{17,20})$');--> statement-breakpoint
ALTER TABLE "starboard_entries" ADD CONSTRAINT "starboard_entries_message_id_snowflake_check" CHECK ("starboard_entries"."message_id" ~ '^(?<id>\d{17,20})$');--> statement-breakpoint
ALTER TABLE "starboard_entries" ADD CONSTRAINT "starboard_entries_starboard_message_id_snowflake_check" CHECK ("starboard_entries"."starboard_message_id" ~ '^(?<id>\d{17,20})$');--> statement-breakpoint
ALTER TABLE "starboard_reactions" ADD CONSTRAINT "starboard_reactions_message_id_snowflake_check" CHECK ("starboard_reactions"."message_id" ~ '^(?<id>\d{17,20})$');--> statement-breakpoint
ALTER TABLE "starboard_reactions" ADD CONSTRAINT "starboard_reactions_user_id_snowflake_check" CHECK ("starboard_reactions"."user_id" ~ '^(?<id>\d{17,20})$');--> statement-breakpoint
ALTER TABLE "user_config" ADD CONSTRAINT "user_config_user_id_snowflake_check" CHECK ("user_config"."user_id" ~ '^(?<id>\d{17,20})$');