/**
 * @file Index
 * @description Creates a new sharding manager and webserver
 * @module index
 */

import config from "../config.js";
import { HibikiShardingManager } from "./classes/Sharder.js";
import { startWebserver } from "./web/server.js";
import path from "node:path";
import url from "node:url";

// Finds the index file
const HIBIKI_INDEX_FILE = path.join(
  path.dirname(url.fileURLToPath(import.meta.url)),
  `hibiki.${process.env.NODE_ENV === "development" ? "ts" : "js"}`,
);

// Creates and spawns the sharding manager
const manager = new HibikiShardingManager(HIBIKI_INDEX_FILE, config.token, "auto");
manager.spawn();

// Starts the Hibiki webserver
if (process.uptime() < 30) {
  startWebserver(config.webserverPort ?? 4000);
}
