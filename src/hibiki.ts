/**
 * @file Creates a Hibiki client instance.
 * @author Espi Marisa <contact@espi.me>
 * @module hibiki
 */

import { env } from "@/utils/env.js";
import { shardingLogger } from "@/utils/logger.js";
import { ActivityType, Client, GatewayIntentBits, Options } from "discord.js";

const DISCORD_STATUSES = env.DISCORD_STATUSES?.split(", ");

let activityState = 0;

export const bot = new Client({
	// Intents to subscribe to
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],

	// Cache sweepers to use
	sweepers: {
		// Use the default sweeper options
		...Options.DefaultSweeperSettings,
	},

	// Caching options
	makeCache: Options.cacheWithLimits({
		// Use the default caching options
		...Options.DefaultMakeCacheSettings,

		// Guild member caching options
		GuildMemberManager: {
			// Always cache the bot's member
			keepOverLimit: (member) => member.id === member.client.user.id,
			maxSize: 300,
		},
	}),
});

// Emit a shardReady when the client is logged in
bot.once("ready", () => {
	if (bot.shard) {
		bot.shard.send({ type: "shardReady" });
	}

	// Cycles client statuses
	if (env.DISCORD_STATUSES) {
		cycleStatuses();
		setInterval(cycleStatuses, 60000);
	}
});

// Logs the client into Discord
bot.login(env.DISCORD_TOKEN).catch((error) => {
	shardingLogger.fatal("Failed to login to Discord:");
	throw new Error(error);
});

/**
 * Dynamically sets Discord client statuses.
 */

function cycleStatuses() {
	if (!DISCORD_STATUSES) {
		return;
	}

	activityState = (activityState + 1) % DISCORD_STATUSES.length;
	const presence = DISCORD_STATUSES[activityState];

	// Sets presence
	if (presence) {
		bot.user?.setActivity(presence.toString(), {
			type: ActivityType.Custom,
		});
	}
}
