/**
 * @file Index
 * @description Creates a new sharding manager and webserver
 * @module index
 */

import config from "../config.js";
import { HibikiShardingManager } from "./classes/Sharder.js";
import { validateConfig } from "./utils/validator.js";
import { startWebserver } from "./web/server.js";
import path from "node:path";

// Checks to see if the config is valid
validateConfig(config);

// Finds the index file
const HIBIKI_INDEX_FILE = path.join(__dirname, `hibiki.${process.env.NODE_ENV === "development" ? "ts" : "js"}`);

// Creates and spawns the sharding manager
const manager = new HibikiShardingManager(HIBIKI_INDEX_FILE, config.hibiki.token, "auto");
manager.spawn();

// Starts the webserver
// shouldn't we not pass an entire class thru this, and instead run 2 functions?
// or join the 2, webserver stuff is a pain

if (process.uptime() < 30) {
  startWebserver();
}
