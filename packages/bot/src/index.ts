import { HibikiShardingManager } from "$classes/Sharder.ts";
import env from "$shared/env.ts";

import "$shared/i18n.ts";

// Use .ts in development. .js in production
// NOTE: In Bun, this doesn't matter, but I'm leaving it as is just in case we decide to compile later
const HIBIKI_INDEX_FILE = `${import.meta.dir}/hibiki.ts`;

// Creates a new sharding manager
const manager = new HibikiShardingManager(HIBIKI_INDEX_FILE, env.BOT_TOKEN, "auto");
manager.spawn();
