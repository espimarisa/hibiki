import "$shared/i18n.ts";

import { HibikiShardingManager } from "$classes/Sharder.ts";
import { env } from "$shared/env.ts";
import { initSentry } from "$shared/sentry.ts";

// Tries to initialize Sentry
initSentry();

const HIBIKI_INDEX_FILE = `${import.meta.dir}/hibiki.ts`;

// Creates a new sharding manager
const manager = new HibikiShardingManager(HIBIKI_INDEX_FILE, env.DISCORD_TOKEN, "auto");
manager.spawn();
