/**
 * @file Database client for interacting with Redis/Valkey.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { env } from "@/utils/env.js";
import { RedisClient } from "bun";

/** Creates a client connecting to Redis/Valkey. */
export const redis = new RedisClient(env.REDIS_URL);
