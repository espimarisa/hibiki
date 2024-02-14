import env from "$shared/env.ts";
import { HibikiClient } from "$classes/Client.ts";

new HibikiClient({
  auth: `Bot ${env.BOT_TOKEN}`,
  gateway: {
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"],
  },
}).init();
