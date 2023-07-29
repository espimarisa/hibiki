import { HibikiClient } from "./classes/Client.js";
import { initSentry } from "$shared/sentry.js";

// Tries to initialize Sentry
initSentry();

// Creates a new Hibiki client
new HibikiClient({ intents: ["GuildMembers"] }).init();
