/**
 * @file env
 * @description Parses and validates environment variables.
 * @author Espi Marisa <contact@espi.me>
 */

import { z } from "zod";

const envSchema = z.object({
	// A valid Discord token. Required.
	DISCORD_TOKEN: z.string().trim().min(1, { message: "Missing Discord token" }),

	// Discord statuses to cycle through. Optional.
	DISCORD_STATUSES: z.string().trim().optional(),

	// Discord testing guild ID to log to/deploy local commands to. Optional.
	DISCORD_GUILD_ID: z.string().trim().optional(),

	// Sentry DSN for submitting errors to. Optional.
	SENTRY_DSN: z.string().trim().optional(),

	// Bun environment variables
	NODE_ENV: z.string().default("DEVELOPMENT"),
	npm_package_name: z.string().default("develop"),
	npm_package_version: z.string().default("develop"),
});

// Environment variable parser
export const env = envSchema.parse(process.env);
