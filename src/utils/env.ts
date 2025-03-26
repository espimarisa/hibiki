/**
 * @file env
 * @description Parses and validates environment variables.
 * @author Espi Marisa <contact@espi.me>
 */

import { DISCORD_TOKEN_REGEX } from "$utils/constants.ts";
import { DISCORD_SNOWFLAKE_REGEX } from "@discordeno/bot";
import { z } from "zod";

const envSchema = z.object({
	// Discord bot token used to login to the Discord API.
	DISCORD_TOKEN: z
		.string()
		.trim()
		.min(1, { message: "Missing DISCORD_TOKEN" })
		.regex(DISCORD_TOKEN_REGEX, "Malformed DISCORD_TOKEN"),

	// Discord Guild ID to deploy to in development mode. Optional.
	DISCORD_GUILD_ID: z
		.string()
		.trim()
		.regex(DISCORD_SNOWFLAKE_REGEX, { message: "Malformed DISCORD_GUILD_ID" })
		.optional(),

	// Statuses to cycle through, delimited by a comma and a space. Optional.
	DISCORD_STATUSES: z.string().optional(),

	// Sentry DSN URL to submit and upload errors to. Optional.
	SENTRY_DSN: z
		.string()
		.trim()
		.url({ message: "Malformed SENTRY_DSN" })
		.optional(),

	// Hex used for authorizing internal HTTP/REST requests.
	REST_AUTH: z.string().trim().min(1, { message: "Missing REST_AUTH" }),

	// Port for the main bot request webserver to listen on.
	BOT_PORT: z.coerce.number().min(1000, {
		message: "Missing/invalid BOT_PORT, be sure it is >=1000",
	}),

	// Port for the main REST proxy webserver to listen on.
	REST_PORT: z.coerce.number().min(1000, {
		message: "Missing/invalid REST_PORT, be sure it is >=1000",
	}),

	// Port for the main gateway webserver to listen on.
	GATEWAY_PORT: z.coerce.number().min(1000, {
		message: "Missing/invalid GATEWAY_PORT, be sure it is >=1000",
	}),

	// Port for the main sharding webserver to listen on.
	SHARDING_PORT: z.coerce.number().min(1000, {
		message: "Missing/invalid SHARDING_PORT, be sure it is >=1000",
	}),

	// Bun environment variables
	NODE_ENV: z.string().default("DEVELOPMENT"),
	npm_package_name: z.string().default("develop"),
	npm_package_version: z.string().default("develop"),
});

// Environment variable parser
export const env = envSchema.parse(process.env);
