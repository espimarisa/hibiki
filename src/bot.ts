/**
 * @file Creates a Discord.js client instance.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { HibikiIntents } from "@/utils/constants.js";
import { env } from "@/utils/env.js";
import { parseError } from "@/utils/error.js";
import { captureError } from "@/utils/error.js";
import { logger } from "@/utils/logger.js";
import { ActivityType, Client, Options } from "discord.js";

let activityState = 0;

/** Creates a new Discord.js client. */
export const bot = new Client({
  intents: HibikiIntents,

  // Cache sweeping settings
  sweepers: {
    ...Options.DefaultSweeperSettings,
  },

  // Cache making options
  makeCache: Options.cacheWithLimits({
    ...Options.DefaultMakeCacheSettings,
    GuildMemberManager: {
      // Only keep 300 cached members in a guild; always keep own member cached
      keepOverLimit: (member) => member.id === member.client.user.id,
      maxSize: 300,
    },
  }),
});

// Ready listener
bot.once("ready", async () => {
  if (bot.shard) {
    try {
      // Emit a ready event to the sharding manager
      await bot.shard.send({ type: "shardReady" });
    } catch (err) {
      const error = parseError(err);
      logger.error(`Failed to emit ready event: ${error.message}`);
      captureError(error);
    }
  }

  // Cycles through bot statuses
  if (env.DISCORD_STATUSES.length > 0) {
    cycleStatuses();
    setInterval(cycleStatuses, 60000);
  }
});

// Logs into Discord
bot.login(env.DISCORD_TOKEN).catch((err) => {
  const error = parseError(err);
  logger.fatal(`Failed to login to Discord: ${error.message}`);
  throw error;
});

/** Cycles bot statuses. */
function cycleStatuses() {
  if (env.DISCORD_STATUSES.length === 0 || !bot.user) {
    return;
  }

  // Gets the status to set
  activityState = (activityState + 1) % env.DISCORD_STATUSES.length;
  const presence = env.DISCORD_STATUSES[activityState];

  // Sets the status
  if (presence) {
    bot.user.setActivity(presence, { type: ActivityType.Custom });
  }
}
