/**
 * @file Hibiki
 * @description Creates a new Hibiki instance
 * @module hibiki
 */

import { HibikiClient } from "./classes/Client.js";
import { env } from "./utils/env.js";
import { getInfo } from "discord-hybrid-sharding";

// Creates the initial instance of Hibiki
new HibikiClient(env.BOT_TOKEN, {
  defaultImageSize: 256,
  gateway: {
    firstShardID: getInfo().FIRST_SHARD_ID,
    lastShardID: getInfo().LAST_SHARD_ID,
    maxShards: getInfo().TOTAL_SHARDS,
    compress: true,
    intents: ["all"],
    disableEvents: {
      // Events to opt out of for some performance boosts
      TYPING_START: true,
      USER_NOTE_UPDATE: true,
      RELATIONSHIP_ADD: true,
      RELATIONSHIP_REMOVE: true,
    },
  },
});
