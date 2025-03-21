/**
 * @file env
 * @description Parses and validates environment variables
 * @author Espi Marisa <contact@espi.me>
 */

import { z } from "zod";

const envSchema = z.object({
	// A valid Discord token. Required.
	DISCORD_TOKEN: z.string().trim().min(1, { message: "Missing Discord token" }),

	// Discord statuses to cycle through. Optional.
	DISCORD_STATUSES: z.string().trim(),

	// Bun environment variables
	NODE_ENV: z.string().default("DEVELOPMENT"),
	npm_package_name: z.string().default("develop"),
	npm_package_version: z.string().default("develop"),
});

// Environment variable parser
export const env = envSchema.parse(process.env);
