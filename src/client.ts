/**
 * @file Creates a Discord.js client instance.
 * @license Zlib
 */

import { env } from "@/root/utils/env.ts";
import { captureError, parseError } from "@/utils/error.ts";
import { logger } from "@/utils/logger.ts";
import {
  ActivityType,
  Client,
  type ClientUser,
  IntentsBitField,
  Options,
  Partials,
} from "discord.js";

let activityState = 0;

const intents = [
  IntentsBitField.Flags.GuildMessages,
  IntentsBitField.Flags.GuildMessageReactions,
  IntentsBitField.Flags.Guilds,
  IntentsBitField.Flags.GuildMembers,
];

/** Creates a Discord.js Client instance. */
export const client = new Client({
  intents: intents,
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  sweepers: {
    ...Options.DefaultSweeperSettings,
  },

  makeCache: Options.cacheWithLimits({
    ...Options.DefaultMakeCacheSettings,
    GuildMemberManager: {
      // Only keep 300 cached members in a guild; always cache self.
      keepOverLimit: (member) => member.id === member.client.user.id,
      maxSize: 300,
    },
  }),
});

// Logs into Discord.
client.login(env.DISCORD_TOKEN).catch((err) => {
  const error = parseError(err);
  logger.fatal(`Failed to login to Discord: ${error.message}`);
  captureError(error);
});

// Ready listener.
client.once("ready", async () => {
  // Do not spawn the shard fully if the user does not exist.
  if (!client.user) {
    logger.fatal("No user object received from Discord.");
    return;
  }

  // Emits a ready event to the sharding manager.
  if (client.shard) {
    try {
      await client.shard.send({ type: "shardReady" });
    } catch (err) {
      const error = parseError(err);
      logger.error(`Failed to emit ready event: ${error.message}`);
      captureError(error);
    }
  }

  // Cycles client statuses if any are set.
  if (env.DISCORD_STATUSES.length > 0) {
    cycleStatuses(client.user, env.DISCORD_STATUSES);
    setInterval(cycleStatuses, 60000, client.user, env.DISCORD_STATUSES);
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

  // Gets the status to set.
  activityState = (activityState + 1) % env.DISCORD_STATUSES.length;
  const presence = env.DISCORD_STATUSES[activityState];

  // Sets the status.
  if (presence) {
    user.setActivity(presence, {
      type: ActivityType.Custom,
    });
  }
}
