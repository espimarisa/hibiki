import { HibikiClusterManager } from "$classes/ClusterManager.ts";
import { env, getEnvIssues } from "$utils/env.ts";
import logger from "$utils/logger.ts";
import { generateErrorMessage } from "zod-error";

// Use .ts in development. .js in production
const HIBIKI_INDEX_FILE = `${import.meta.dir}/hibiki.${env.NODE_ENV === "production" ? "js" : "ts"}`;

// Validates environment variables before launching
const issues = getEnvIssues();

if (issues?.length) {
  // Makes zod errors actually readable
  logger.error(`Invalid environment variables:`);
  throw new Error(generateErrorMessage(issues, { delimiter: { error: "\\n" } }));
}

// Spawns a new cluster manager
const manager = new HibikiClusterManager(HIBIKI_INDEX_FILE, env.BOT_TOKEN, "auto");
manager.spawn();
