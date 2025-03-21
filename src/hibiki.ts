/**
 * @file hibiki
 * @description Initializes a Hibiki client instance
 * @module hibiki
 */

import { HibikiClient } from "$classes/HibikiClient.ts";
import { GatewayIntentBits, Options } from "discord.js";

const subscribedIntents = [
	// Required for guild, channel, and role objects
	GatewayIntentBits.Guilds,

	// PRIVILEGED: Required for getting guild member data
	GatewayIntentBits.GuildMembers,
] satisfies GatewayIntentBits[];

new HibikiClient({
	// Cache sweeping options
	sweepers: {
		// Use the default sweeper settings
		...Options.DefaultSweeperSettings,
	},

	// Caching options
	makeCache: Options.cacheWithLimits({
		// Use the default settings
		...Options.DefaultMakeCacheSettings,

		// Only cache up to 200 members at once
		GuildMemberManager: {
			maxSize: 200,
			keepOverLimit: (member) => member.id === member.client.user.id,
		},

		// Do not cache reactions
		ReactionManager: 0,
	}),

	// Intents to subscribe to
	intents: subscribedIntents,
}).init();
