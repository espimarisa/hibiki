import { HibikiShardingManager } from "./classes/Sharder.js";
import { sanitizedEnv } from "./utils/env.js";
import path from "node:path";
import url from "node:url";

// Searches for the root Hibiki file
const pathDirname = path.dirname(url.fileURLToPath(import.meta.url));
const HIBIKI_INDEX_FILE = `${pathDirname}/hibiki.${sanitizedEnv.isProduction ? "js" : "ts"}`;

// Creates a new sharding manager/
const manager = new HibikiShardingManager(HIBIKI_INDEX_FILE, sanitizedEnv.BOT_TOKEN, "auto");
manager.spawn();
