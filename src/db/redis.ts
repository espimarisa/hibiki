/**
 * @file Database client for interacting with Redis/Valkey.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { env } from "@/root/utils/env.js";
import { RedisClient } from "bun";

/** A Redis connection client. */
export const redis = new RedisClient(env.REDIS_URL);
