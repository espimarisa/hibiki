/**
 * @file Index
 * @description Creates a new sharding manager and webserver
 * @module index
 */

import config from "../config.json";
import { HibikiShardingManager } from "./classes/Sharder";
// import { startWebserver } from "./web/server";
import path from "node:path";

// Finds the index file
const HIBIKI_INDEX_FILE = path.join(__dirname, `hibiki.${process.env.NODE_ENV === "development" ? "ts" : "js"}`);

// Creates and spawns the sharding manager
const manager = new HibikiShardingManager(HIBIKI_INDEX_FILE, config.hibiki.token, "auto");
manager.spawn();

/* Starts the webserver
if (process.uptime() < 30) {
  startWebserver();
} */
