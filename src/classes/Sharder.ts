/**
 * @file Sharder
 * @description Creates and manages shards
 * @module HibikiShardingManager
 */

import type { PathLike } from "node:fs";
import type WebInternalApi from "web/internalApi/api";
import { logger } from "../utils/logger";
import { ShardClientUtil, ShardingManager } from "discord.js";
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
type Auto = number | "auto";

export class HibikiShardingManager {
  readonly shardingManager: ShardingManager;
  private readonly _mainFile: PathLike;
  private readonly _token: string;
  private readonly _shardCount: Auto;
  private readonly _internalWebApi: WebInternalApi;

  /**
   * Creates a new Hibiki sharding manager
   * @param file The file to launch
   * @param token The token to login with
   * @param shardCount The amount of shards to launch
   */

  constructor(file: PathLike, token: string, shardCount: Auto = "auto", internalWebApi: WebInternalApi) {
    this._mainFile = file;
    this._shardCount = shardCount;
    this._token = token;
    this._internalWebApi = internalWebApi;

    this.shardingManager = new ShardingManager(this._mainFile.toString(), {
      token: this._token,
      totalShards: this._shardCount,
      mode: IS_DEVELOPMENT ? "process" : "worker",
      execArgv: process.execArgv,
      respawn: false,
    });
  }

  /**
   * Spawns all shards
   */

  public spawn() {
    this.shardingManager.spawn({ amount: this._shardCount });

    // Shard event listeners
    this.shardingManager.on("shardCreate", (shard) => {
      shard.on("death", () => {
        logger.error(`Shard #${shard.id} died`);
      });

      shard.on("disconnect", () => {
        logger.warn(`Shard #${shard.id} disconnected`);
      });

      shard.on("error", (error) => {
        logger.error(`Shard #${shard.id} encountered an error: ${error}`);
      });

      shard.on("ready", () => {
        logger.info(`Shard #${shard.id} is ready`);
        // Send the internal web api to the shard
        shard.emit("hibiki_internal_web_api", this._internalWebApi);
      });

      shard.on("reconnection", () => {
        logger.warn(`Shard #${shard.id} is reconnecting`);
      });

      shard.on("spawn", () => {
        logger.info(`Shard #${shard.id} was spawned`);
      });
    });
  }
}

/**
 * Returns the amount of total cached guilds on every shard
 * @param shard The shardClientUtil to use
 * @returns A number of cached guilds
 */

export async function fetchTotalCachedGuilds(shard: ShardClientUtil | null) {
  if (!shard) return;
  const values = await shard.fetchClientValues("guilds.cache.size");
  if (!values?.length) return;
  return values.reduce((a, b) => (a as number) + (b as number)) as number;
}

/**
 * Returns the amount of total cached users on every shard
 * @param shard The shardClientUtil to use
 * @returns A number of cached users
 */

export async function fetchTotalCachedUsers(shard: ShardClientUtil | null) {
  if (!shard) return;
  const values = await shard.fetchClientValues("users.cache.size");
  if (!values?.length) return;
  return values.reduce((a, b) => (a as number) + (b as number)) as number;
}
