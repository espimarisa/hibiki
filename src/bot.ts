/**
 * @file Creates a Discord.js client instance.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { env } from "@utils/env.js";
import { parseError } from "@utils/error.js";
import { captureError } from "@utils/error.js";
import { logger } from "@utils/logger.js";
import {
  ActivityType,
  Client,
  type ClientUser,
  GatewayIntentBits,
  Options,
} from "discord.js";

let activityState = 0;

const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.MessageContent,
];

/** Primary Discord.js client instance. */
export const bot = new Client({
  intents: intents,

  // Cache sweeping settings
  sweepers: {
    ...Options.DefaultSweeperSettings,
  },

  // Cache making options
  makeCache: Options.cacheWithLimits({
    ...Options.DefaultMakeCacheSettings,
    GuildMemberManager: {
      // Only keep 300 cached members in a guild; always cache self
      keepOverLimit: (member) => member.id === member.client.user.id,
      maxSize: 300,
    },
  }),
});

// Logs into Discord
bot.login(env.DISCORD_TOKEN).catch((err) => {
  const error = parseError(err);
  logger.fatal(`Failed to login to Discord: ${error.message}`);
  captureError(error);
});

// Ready listener
bot.once("ready", async () => {
  // Do not spawn the shard fully if the user does not exist
  if (!bot.user) {
    logger.fatal("No user object received from Discord.");
    return;
  }

  // Emits a ready event to the sharding manager
  if (bot.shard) {
    try {
      await bot.shard.send({ type: "shardReady" });
    } catch (err) {
      const error = parseError(err);
      logger.error(`Failed to emit ready event: ${error.message}`);
      captureError(error);
    }
  }

  // Cycles client statuses if any are set
  if (env.DISCORD_STATUSES.length > 0) {
    cycleStatuses(bot.user, env.DISCORD_STATUSES);
    setInterval(cycleStatuses, 60000, bot.user, env.DISCORD_STATUSES);
  }
});

/**
 * Cycles through an array of bot client statuses.
 * @param user The client user to set the status on.
 * @param statuses An array of statuses to cycle through.
 */

function cycleStatuses(user: ClientUser, statuses: string[]) {
  if (!(user && statuses.length > 0)) {
    return;
  }

  // Gets the status to set
  activityState = (activityState + 1) % env.DISCORD_STATUSES.length;
  const presence = env.DISCORD_STATUSES[activityState];

  // Sets the status
  if (presence) {
    user.setActivity(presence, {
      type: ActivityType.Custom,
    });
  }
}
