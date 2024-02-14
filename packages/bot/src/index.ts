import env from "$shared/env.ts";
import { HibikiClusterManager } from "$classes/ClusterManager.ts";

// Use .ts in development. .js in production
const HIBIKI_INDEX_FILE = `${import.meta.dir}/hibiki.${env.NODE_ENV === "production" ? "js" : "ts"}`;

// Spawns a new cluster manager
const manager = new HibikiClusterManager(HIBIKI_INDEX_FILE, env.BOT_TOKEN, "auto");
manager.spawn();
