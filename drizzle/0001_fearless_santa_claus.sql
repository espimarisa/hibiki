ALTER TABLE "guild_config" ADD COLUMN "star_amount" integer;--> statement-breakpoint
ALTER TABLE "guild_config" ADD COLUMN "starboard_channel" text;--> statement-breakpoint
ALTER TABLE "guild_config" ADD CONSTRAINT "starboard_count not <= 0" CHECK ("guild_config"."star_amount" > 0);