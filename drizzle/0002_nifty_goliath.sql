ALTER TABLE "guild_config" DROP CONSTRAINT "starboard_count not <= 0";--> statement-breakpoint
ALTER TABLE "guild_config" DROP COLUMN "star_amount";--> statement-breakpoint
ALTER TABLE "guild_config" DROP COLUMN "starboard_channel";