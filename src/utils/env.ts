/**
 * @file env
 * @description Parses and validates environment variables.
 * @author Espi Marisa <contact@espi.me>
 */

import { z } from "zod";

const envSchema = z.object({
	// Discord bot token to login to the API with.
	DISCORD_TOKEN: z.string().trim().min(1, { message: "Missing Discord token" }),

	// Discord Guild ID to deploy to in development mode.
	DISCORD_GUILD_ID: z.string().trim().optional(),

	// Statuses to cycle through. Delimited by a comma and a space.
	DISCORD_STATUSES: z.string().trim().optional(),

	// Sentry DSN URL to upload errors to.
	SENTRY_DSN: z.string().trim().optional(),

	// Bun environment variables
	NODE_ENV: z.string().default("DEVELOPMENT"),
	npm_package_name: z.string().default("develop"),
	npm_package_version: z.string().default("develop"),
});

// Environment variable parser
export const env = envSchema.parse(process.env);
