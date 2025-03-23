/**
 * @file hibiki
 * @description Creates and manages a proxyCacheInstance and Hibiki client.
 * @author Espi Marisa <contact@espi.me>
 */

import { env } from "$utils/env.ts";
import { Intents, createBot } from "@discordeno/bot";
import { createProxyCache } from "dd-cache-proxy";

// Creates a new bot instance
const rawBot = createBot({
	intents: Intents.Guilds,
	token: env.DISCORD_TOKEN,

	// Data to opt-in to
	desiredProperties: {
		// Guild properties
		guild: {
			id: true,
			name: true,
		},
		// Member properties
		member: {
			id: true,
			user: true,
		},
		// Interaction properties
		interaction: {
			data: true,
			guild: true,
			id: true,
			member: true,
			token: true,
			type: true,
		},
		// User properties
		user: {
			discriminator: true,
			id: true,
			username: true,
		},
	},
});

// Creates a new proxy cache instance
export const bot = createProxyCache(rawBot, {
	// Cache options
	cacheInMemory: {
		default: false,
		guild: true,
	},
	// Properties to cache
	desiredProps: {
		guild: ["id", "members", "name"],
		member: ["id", "user"],
		user: ["discriminator", "id", "tag", "username"],
	},
});
