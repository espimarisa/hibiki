/**
 * @file ready
 * @description Event listener and handler for the ready event.
 * @author Espi Marisa <contact@espi.me>
 */

import { bot } from "$root/hibiki.ts";

/**
 * Runs a ready listener when the ready event is fired.
 */

bot.events.ready = ({ user, shardId }) => {
	// Log when all shards are connected
	if (shardId === bot.gateway.lastShardId) {
		bot.logger.info(
			`Connected to Discord as ${user.username}#${user.discriminator}`,
		);
	}
};
