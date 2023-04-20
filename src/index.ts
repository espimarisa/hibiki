/**
 * @file Index
 * @description Creates a new sharding client
 * @module index
 */

import { env } from "./utils/env.js";
import { logger } from "./utils/logger.js";
import { ClusterManager } from "discord-hybrid-sharding";
import path from "node:path";
import url from "node:url";

// Searches for the root Hibiki file
const pathDirname = path.dirname(url.fileURLToPath(import.meta.url));
const HIBIKI_INDEX_FILE = `${pathDirname}/hibiki.${process.env.NODE_ENV === "development" ? "ts" : "js"}`;

// Creates a new sharding manager/
const manager = new ClusterManager(HIBIKI_INDEX_FILE, {
  totalShards: "auto",
  mode: env.isProduction ? "worker" : "process",
  token: env.BOT_TOKEN,
});

// Logs when a cluster is created
manager.on("clusterCreate", (cluster) => {
  logger.info(`Spawned shard cluster ${cluster.id}`);
});

// Logs when a cluster is ready
manager.on("clusterReady", (cluster) => {
  logger.info(`Shard cluster ${cluster.id} is ready`);
});

// Spawns all clusters
manager.spawn();
