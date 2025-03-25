/**
 * @file status
 * @description Utilities for setting and updating the bot's status(es).
 * @author Espi Marisa <contact@espi.me>
 */

import { ActivityTypes } from "@discordeno/types";
import { bot } from "src/bot.ts";
let activityState = 0;

/**
 * Updates the bot's status every 5 minutes.
 * @param statuses An array of statuses to cycle through.
 */

export async function cycleStatuses(statuses: string[]) {
	// Don't update anything if there is no status
	if (statuses?.length === 0) {
		return;
	}

	// Calculates what status to set
	activityState = (activityState + 1) % statuses.length;
	const presence = statuses[activityState];
	if (!presence) {
		return;
	}

	// Updates the status
	await bot.gateway.editBotStatus({
		status: "online",
		activities: [
			{
				name: presence,
				state: presence,
				type: ActivityTypes.Custom,
			},
		],
	});

	// Only run a loop if there is more than 1 status
	if (statuses.length > 1) {
		// Cycle through each status every 10 minutes
		setInterval(cycleStatuses, 600000, statuses);
	}
}
