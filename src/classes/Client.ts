/**
 * @file Client
 * @description Connects to Discord and handles global functions
 */

import { logger } from "../utils/logger.js";
import { DatabaseManager } from "./Database.js";
import { Client, Intents } from "discord.js";

export class HibikiClient extends Client {
  readonly config: HibikiConfig;

  // Hibiki's current version, defined in package.json
  readonly version: string = process.env.npm_package_version ?? "develop";

  // A Prisma + Hibiki Database Manager
  readonly db: DatabaseManager = new DatabaseManager();

  constructor(config: HibikiConfig) {
    super({
      ...config.options,
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    });

    this.config = config;

    this.once("ready", async () => this.init());
  }

  /**
   * Initialises Hibiki
   */

  public async init() {
    this.login(this.config.hibiki.token).then(async () => {
      logger.info(`Logged in as ${this.user?.tag} in ${this.guilds.cache.size} guilds on shard #${this.shard?.ids[0]}}`);
    });
  }
}
