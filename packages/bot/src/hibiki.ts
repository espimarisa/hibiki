import { HibikiClient } from "./classes/Client.ts";
import { GatewayIntentBits, Options } from "discord.js";

const subscribedIntents = [
  // Required for guild, channel, and role objects
  GatewayIntentBits.Guilds,

  // PRIVILEGED: Required for getting guild member data
  GatewayIntentBits.GuildMembers,
] satisfies GatewayIntentBits[];

// Creates a new Hibiki client
new HibikiClient({
  // Cache sweeping options
  sweepers: {
    ...Options.DefaultSweeperSettings,
  },

  // Cache options
  makeCache: Options.cacheWithLimits({
    ...Options.DefaultMakeCacheSettings,
    ReactionManager: 0,
    GuildMemberManager: {
      maxSize: 200,
      keepOverLimit: (member) => member.id === member.client.user.id,
    },
  }),

  // Intents
  intents: subscribedIntents,
}).init();
