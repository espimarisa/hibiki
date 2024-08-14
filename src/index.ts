import "$utils/i18n.ts";

import { HibikiShardingManager } from "$classes/Sharder.ts";
import { env } from "$utils/env.ts";
import { initSentry } from "$utils/sentry.ts";

// Tries to initialize Sentry
initSentry();

// Creates a new sharding manager
const manager = new HibikiShardingManager(`${import.meta.dir}/hibiki.ts`, env.DISCORD_TOKEN, "auto");
manager.spawn();
