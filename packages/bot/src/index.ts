import env from "$shared/env.ts";
import { HibikiShardingManager } from "$classes/Sharder.ts";

// Use .ts in development. .js in production
const HIBIKI_INDEX_FILE = `${import.meta.dir}/hibiki.${env.NODE_ENV === "production" ? "js" : "ts"}`;

// Creates a new sharding manager
const manager = new HibikiShardingManager(HIBIKI_INDEX_FILE, env.BOT_TOKEN, "auto");
manager.spawn();
