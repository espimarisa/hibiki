/**
 * @file Database client for interacting with Redis/Valkey.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { RedisClient } from "bun";
import { env } from "@utils/env.js";

/** A Redis connection client. */
export const redis = new RedisClient(env.REDIS_URL);
