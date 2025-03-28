/**
 * @file Parses and validates environment variables.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/env
 */

import process from "node:process";
import { DISCORD_TOKEN_REGEX } from "@/utils/constants.ts";
import { z } from "zod";

// An object containing expected environment variables
const envSchema = z.object({
	DISCORD_TOKEN: z
		.string()
		.trim()
		.min(1, { message: "Missing DISCORD_TOKEN" })
		.regex(DISCORD_TOKEN_REGEX, "Malformed DISCORD_TOKEN"),

	DISCORD_GUILD_ID: z.string().optional(),
	DISCORD_STATUSES: z.string().optional(),
	SENTRY_DSN: z.string().optional(),

	NODE_ENV: z.string().default("DEVELOPMENT"),
	npm_package_name: z.string().default("develop"),
	npm_package_version: z.string().default("develop"),
});

// Parses and validates environment variables
export const env = envSchema.parse(process.env);
