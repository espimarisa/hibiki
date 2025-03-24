/**
 * @file ready
 * @description Event listener and handler for the ready event.
 * @author Espi Marisa <contact@espi.me>
 */

import { bot } from "$root/bot.ts";
import { env } from "$utils/env.ts";
import { cycleStatuses } from "$utils/status.ts";

/**
 * Runs a ready listener when the ready event is fired.
 */

bot.events.ready = async ({ user, shardId }) => {
	// Log when all shards are connected
	if (shardId === bot.gateway.lastShardId) {
		bot.logger.info(`Connected to Discord as ${user.tag}`);

		// Cycle through statuses if any are set
		if (env.DISCORD_STATUSES && env.DISCORD_STATUSES.split(", ").length > 0) {
			await cycleStatuses(env.DISCORD_STATUSES.split(", "));
		}
	}
};
