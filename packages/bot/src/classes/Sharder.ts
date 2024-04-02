import { type ShardClientUtil, ShardingManager } from "discord.js";

import { env } from "$shared/env.ts";
import { logger } from "$shared/logger.ts";

type Auto = number | "auto";

export class HibikiShardingManager {
  readonly shardingManager: ShardingManager;
  private readonly _mainFile: string;
  private readonly _token: string;
  private readonly _shardCount: Auto;

  // Creates a new Sharding manager
  constructor(file: string, token: string, shardCount: Auto = "auto") {
    this._mainFile = file;
    this._shardCount = shardCount;
    this._token = token;

    this.shardingManager = new ShardingManager(this._mainFile, {
      token: this._token,
      totalShards: this._shardCount,
      mode: env.NODE_ENV === "production" ? "worker" : "process",
      execArgv: process.execArgv,
      respawn: false,
    });
  }

  // Spawns all shards
  spawn() {
    this.shardingManager.spawn({ amount: this._shardCount }).catch((error: unknown) => {
      throw new Error(Bun.inspect(error));
    });

    // Shard event listeners
    this.shardingManager.on("shardCreate", (shard) => {
      shard.on("death", () => {
        logger.error(`Shard #${shard.id.toString()} died`);
      });

      shard.on("disconnect", () => {
        logger.warn(`Shard #${shard.id.toString()} disconnected`);
      });

      shard.on("error", (error) => {
        logger.error(`Shard #${shard.id.toString()} encountered an error:`);
        throw new Error(Bun.inspect(error));
      });

      shard.on("ready", () => {
        logger.info(`Shard #${shard.id.toString()} is ready`);
      });

      shard.on("reconnecting", () => {
        logger.warn(`Shard #${shard.id.toString()} is reconnecting`);
      });

      shard.on("spawn", () => {
        logger.info(`Shard #${shard.id.toString()} was spawned`);
      });
    });
  }
}

// Returns the amount of total cached guilds on every shard
export async function fetchTotalCachedGuilds(shard: ShardClientUtil | null) {
  if (!shard) {
    return;
  }

  const values = (await shard.fetchClientValues("guilds.cache.size")) as number[];
  if (values.length === 0) {
    return;
  }

  return values.reduce((a, b) => a + b);
}

// Returns the amount of total cached users on every shard
export async function fetchTotalCachedUsers(shard: ShardClientUtil | null) {
  if (!shard) {
    return;
  }

  const values = (await shard.fetchClientValues("users.cache.size")) as number[];
  if (values.length === 0) {
    return;
  }

  return values.reduce((a, b) => a + b);
}
