import { HibikiClient } from "./classes/Client.js";
import { initSentry } from "$shared/sentry.js";
import { GatewayIntentBits } from "discord.js";

export const subscribedIntents: GatewayIntentBits[] = [
  // Required for guild, channel, and role objects
  GatewayIntentBits.Guilds,

  // Required for incoming messages
  GatewayIntentBits.GuildMessages,

  // PRIVILEGED: Required for getting guild member data
  GatewayIntentBits.GuildMembers,
];

// Tries to initialize Sentry
initSentry();

// Creates a new Hibiki client
new HibikiClient({ intents: subscribedIntents }).init();
