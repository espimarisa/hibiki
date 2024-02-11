import { HibikiClient } from "$classes/Client.ts";
import { env } from "./utils/env.ts";

new HibikiClient({
  auth: `Bot ${env.BOT_TOKEN}`,
  gateway: {
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"],
  },
}).init();
