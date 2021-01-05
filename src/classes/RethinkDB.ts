/**
 * @file RethinkDB
 * @description Handles all RethinkDB functionality and functions
 */

import { logger } from "../helpers/logger";
import { r } from "rethinkdb-ts";
import config from "../../config.json";

/** Starts RethinkDB */
export function startRethink() {
  return r.connectPool({
    db: config.database.db || undefined,
    password: config.database.password || undefined,
    port: Number(config.database.port) || 28015,
    host: config.database.host || undefined,
    user: config.database.user || undefined,
    silent: true,
  });
}

// Starts RethinkDB and catches any errors
startRethink().catch((err) => {
  logger.error(`RethinkDB failed to start. Be sure the config file is setup properly and that it's running. Exiting. (error: ${err})`);
  process.exit(1);
});

export class RethinkProvider {
  db: typeof r;
  dblock: any;

  constructor() {
    this.db = r;
    this.dblock = this.db.db(config.database.db ?? "db").wait();
  }

  /**
   * Guild config functions
   */

  // Gets a guild's config
  async getGuildConfig(guild: string): Promise<GuildConfig> {
    await this.dblock;
    return this.db.table("guildconfig").get(guild).run() as Promise<GuildConfig>;
  }

  // Updates a guild's config
  async updateGuildConfig(config: GuildConfig) {
    await this.dblock;
    return this.db.table("guildconfig").update(config).run();
  }

  // Deletes a guild's config
  async deleteGuildConfig(guild: string) {
    await this.dblock;
    return this.db.table("guildconfig").get(guild).delete().run();
  }

  // Inserts a blank guildconfig
  async insertBlankGuildConfig(guild: string) {
    await this.dblock;
    return this.db.table("guildconfig").insert({ id: guild }).run();
  }

  /**
   * User config functions
   */

  // Gets a user's config
  async getUserConfig(user: string): Promise<UserConfig> {
    await this.dblock;
    return this.db.table("userconfig").get(user).run() as Promise<UserConfig>;
  }

  // Updates a user's config
  async updateUserConfig(config: UserConfig) {
    await this.dblock;
    return this.db.table("userconfig").update(config).run();
  }

  // Deletes a user's config
  async deleteUserConfig(user: string) {
    await this.dblock;
    return this.db.table("userconfig").get(user).delete().run();
  }

  // Inserts a blank userconfig
  async insertBlankUserConfig(user: string) {
    await this.dblock;
    return this.db.table("userconfig").insert({ id: user }).run();
  }

  /**
   * Punishment functions
   */

  // Gets the mute cache
  async getMuteCache() {
    await this.dblock;
    return this.db.table("mutecache").run() as Promise<MuteCache>;
  }

  // Inserts a muteCache
  async insertMuteCache(config: MuteCache) {
    await this.dblock;
    return this.db.table("mutecache").insert(config).run();
  }

  // Inserts a user warning
  async insertUserWarning(warning: UserWarning) {
    await this.dblock;
    return this.db.table("warnings").insert(warning).run();
  }

  /**
   * Other database functions
   */

  // Gets a blacklisted guild
  async getBlacklistedGuild(guild: string) {
    await this.dblock;
    return this.db.table("blacklist").get(guild).run();
  }
}