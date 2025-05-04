/**
 * @file Database client for interacting with Redis/Valkey.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { env } from "@/root/utils/env.js";
import { RedisClient } from "bun";

/**
 * Creates a Redis database client.
 */

export const redis = new RedisClient(env.REDIS_URL);
