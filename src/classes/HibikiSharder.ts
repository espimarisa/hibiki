/**
 * @file HibikiSharder
 * @description Creates and manages shards
 * @author Espi Marisa <contact@espi.me>
 */

import { env } from "$utils/env.ts";
import { logger } from "$utils/logger.ts";
import { type ShardClientUtil, ShardingManager } from "discord.js";

export class HibikiSharder {
	readonly shardingManager: ShardingManager;
	private readonly _mainFile: string;
	private readonly _shardCount: number | "auto";
	private readonly _token: string;

	/**
	 * Creates a new sharder
	 * @param file The main bot file to run on each shard
	 * @param shardCount The amount of shards to spawn
	 * @param token The token to login with on each shard
	 */

	constructor(file: string, shardCount: number | "auto", token: string) {
		this._mainFile = file;
		this._shardCount = shardCount;
		this._token = token;

		// Creates the sharding manager
		this.shardingManager = new ShardingManager(this._mainFile, {
			// Pass execution arguments through
			execArgv: process.execArgv,
			// Use worker_threads in production; process in development
			mode: env.NODE_ENV === "production" ? "worker" : "process",
			token: this._token,
			totalShards: this._shardCount,
		});
	}

	/**
	 * Spawns all shards
	 */

	spawn() {
		this.shardingManager
			.spawn({ amount: this._shardCount })
			.catch((error: unknown) => {
				throw new Error(Bun.inspect(error));
			});

		// Event listeners for each shard
		this.shardingManager.on("shardCreate", (shard) => {
			// Shard death listener
			shard.on("death", () => {
				logger.error(`Shard #${shard.id.toString()} died`);
			});

			// Shard disconnect listener
			shard.on("disconnect", () => {
				logger.warn(`Shard #${shard.id.toString()} disconnected`);
			});

			// Shard error listener
			shard.on("error", (error) => {
				logger.error(`Shard #${shard.id.toString()} encountered an error:`);
				throw new Error(Bun.inspect(error));
			});

			// Shard ready listener
			shard.on("ready", () => {
				logger.info(`Shard #${shard.id.toString()} is ready`);
			});

			// Shard reconnect listener
			shard.on("reconnecting", () => {
				logger.warn(`Shard #${shard.id.toString()} is reconnecting`);
			});

			// Shard spawn listener
			shard.on("spawn", () => {
				logger.info(`Shard #${shard.id.toString()} was spawned`);
			});
		});
	}
}

/**
 * Returns the total amount of cached guilds across all shards
 * @param shard The shard to run the function on
 * @returns The total amount of cached guilds across all shards
 */

export async function fetchTotalCachedGuilds(shard: ShardClientUtil | null) {
	if (!shard) {
		return;
	}

	// Gets the total amount of guilds
	const values = (await shard.fetchClientValues(
		"guilds.cache.size",
	)) as number[];
	if (values.length === 0) {
		return;
	}

	return values.reduce((a, b) => a + b);
}

/**
 * Returns the total amount of cached users across all shards
 * @param shard The shard to run the function on
 * @returns The total amount of cached users across all shards
 */

export async function fetchTotalCachedUsers(shard: ShardClientUtil | null) {
	if (!shard) {
		return;
	}

	// Gets the total amount of users
	const values = (await shard.fetchClientValues(
		"users.cache.size",
	)) as number[];
	if (values.length === 0) {
		return;
	}

	return values.reduce((a, b) => a + b);
}
