/**
 * @file bot
 * @description Creates and manages a proxyCacheInstance bot.
 * @author Espi Marisa <contact@espi.me>
 */

import { env } from "$utils/env.ts";
import {
	Intents,
	LogDepth,
	createBot,
	createDesiredPropertiesObject,
	type logger as discordenoLogger,
} from "@discordeno/bot";
import { createProxyCache } from "dd-cache-proxy";

// Declutters BotDesiredProperties types
interface BotDesiredProperties extends Required<typeof desiredProperties> {}

// Desired Discordeno properties
const desiredProperties = createDesiredPropertiesObject({
	guild: {
		id: true,
		name: true,
	},
	member: {
		id: true,
		user: true,
	},
	interaction: {
		data: true,
		guild: true,
		id: true,
		member: true,
		token: true,
		type: true,
	},
	user: {
		discriminator: true,
		id: true,
		toggles: true,
		username: true,
	},
});

// Creates a new bot instance
const rawBot = createBot({
	desiredProperties: desiredProperties as BotDesiredProperties,
	intents: Intents.Guilds,
	token: env.DISCORD_TOKEN,
});

// Creates a new proxy cache instance
export const bot = createProxyCache(rawBot, {
	// Memory caching options
	cacheInMemory: {
		default: false,
		guild: true,
		user: true,
	},
	// Properties to cache
	desiredProps: {
		guild: ["id", "members", "name"],
		user: ["discriminator", "id", "tag", "toggles", "username"],
	},
	sweeper: {
		// Run the sweeper every 5 minutes
		interval: 300000,
		filter: {
			guild: (g) => {
				// Remove non-accessed guilds after 15 minutes
				if (Date.now() - g.lastInteractedTime > 900000 && g.id !== bot.id) {
					return true;
				}

				return false;
			},
			member: (m) => {
				// Remove non-accessed members after 15 minutes
				if (Date.now() - m.lastInteractedTime > 900000 && m.id !== bot.id) {
					return true;
				}

				return false;
			},
		},
	},
});

// Sets our logging depth and makes TS happy
(bot.logger as typeof discordenoLogger).setDepth(LogDepth.Full);
