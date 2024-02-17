import { HibikiClient } from "./classes/Client.ts";
import { GatewayIntentBits } from "discord.js";

export const subscribedIntents = [
  // Required for guild, channel, and role objects
  GatewayIntentBits.Guilds,

  // Required for incoming messages
  GatewayIntentBits.GuildMessages,

  // PRIVILEGED: Required for getting guild member data
  GatewayIntentBits.GuildMembers,
] satisfies GatewayIntentBits[];

// Creates a new Hibiki client
new HibikiClient({
  intents: subscribedIntents,
}).init();
