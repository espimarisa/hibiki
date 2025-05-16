/**
 * @file Creates a Discord.js client.
 * @license zlib
 */

import { env } from "@/utils/env.ts";
import { clientLog } from "@/utils/logger.ts";
import { captureException } from "@sentry/bun";
import {
  ActivityType,
  Client,
  GatewayIntentBits,
  Options,
  Partials,
} from "discord.js";

let activityState = 0;

// Intents to enable.
const intents = [
  // GUILDS is required for general functionality.
  GatewayIntentBits.Guilds,

  // GUILD_MEMBERS is required for member resolution.
  GatewayIntentBits.GuildMembers,

  // GUILD_MESSAGE_REACTIONS and GUILD_MESSAGES are required for the starboard.
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.GuildMessages,
];

// Partials to enable.
const partials = [Partials.Message, Partials.Reaction, Partials.User];

// Creates a new Discord.js client.
export const client = new Client({
  intents: intents,
  partials: partials,
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
try {
  client.login(env.DISCORD_TOKEN);
} catch (err) {
  clientLog.error(err, "Failed to login to Discord.");
  captureException(err);
}

// Ready listener.
client.once("ready", async (readyClient) => {
  // Emits a ready event to the sharding manager.
  if (readyClient.shard) {
    try {
      await readyClient.shard.send({ type: "shardReady" });
    } catch (err) {
      clientLog.error(err, "Failed to emit ready event.");
      captureException(err);
    }
  }

  // Cycles through configured statuses every 3 minutes.
  if (env.DISCORD_STATUSES.length > 0) {
    setInterval(() => {
      activityState = (activityState + 1) % env.DISCORD_STATUSES.length;
      const presence = env.DISCORD_STATUSES[activityState];

      // Sets the status.
      if (presence) {
        readyClient.user.setActivity(presence, {
          type: ActivityType.Custom,
        });
      }
    }, 60_000 * 3);
  }
});
