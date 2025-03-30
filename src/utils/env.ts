/**
 * @file Parses and validates environment variables.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/env
 */

import { z } from "zod";
import process from "node:process";

// A regex for validating Discord bot tokens
const DISCORD_TOKEN_REGEX = /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/;

// An object containing expected environment variables
const envSchema = z.object({
	// Bot token to log into the Discord API with
	DISCORD_TOKEN: z
		.string()
		.trim()
		.min(1, { message: "Missing DISCORD_TOKEN" })
		.regex(DISCORD_TOKEN_REGEX, "Malformed DISCORD_TOKEN"),

	// Discord Guild ID to use for development mode/event logging
	DISCORD_DEV_GUILD_ID: z.string().optional(),

	// A comma-space delimited list of Discord statuses to set
	DISCORD_STATUSES: z.string().optional(),

	// A Sentry DSN URL (https) to submit and upload errors to
	SENTRY_DSN: z.string().optional(),

	// Bun variables to ensure always exist
	NODE_ENV: z.string().default("DEVELOPMENT"),
	npm_package_name: z.string().default("develop"),
	npm_package_version: z.string().default("develop"),
});

// Parses and validates environment variables
export const env = envSchema.parse(process.env);
