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

  /** Creates a new database provider */
  constructor() {
    this.db = r;
    this.dblock = this.db.db(config.database.db ?? "db").wait();
  }

  async getGuildConfig(guild: string) {
    await this.dblock;
    return this.db.table("guildconfig").get(guild).run();
  }

  async getUserConfig(user: string) {
    await this.dblock;
    return this.db.table("userconfig").get(user).run();
  }

  async getBlacklistedGuild(guild: string) {
    await this.dblock;
    return this.db.table("blacklist").get(guild).run();
  }

  async updateGuildConfig(config: Record<string, unknown>) {
    await this.dblock;
    return this.db.table("guildconfig").update(config).run();
  }

  async updateUserConfig(config: Record<string, unknown>) {
    await this.dblock;
    return this.db.table("userconfig").update(config).run();
  }

  async getMuteCache() {
    await this.dblock;
    return this.db.table("mutecache").run();
  }

  async deleteGuildConfig(guild: string) {
    await this.dblock;
    return this.db.table("guildconfig").get(guild).delete().run();
  }

  async deleteUserConfig(user: string) {
    await this.dblock;
    return this.db.table("userconfig").get(user).delete().run();
  }

  async insertBlankUserConfig(user: string | number) {
    await this.dblock;
    return this.db
      .table("userconfig")
      .insert({
        id: user,
      })
      .run();
  }

  async insertBlankGuildConfig(guild: string) {
    await this.dblock;
    return this.db
      .table("guildconfig")
      .insert({
        id: guild,
      })
      .run();
  }

  // TODO: stop passing configs as record and pass each value
  /** Updates a guild's mute cache */
  async insertMuteCache(config: Record<string, unknown>) {
    await this.dblock;
    return this.db.table("mutecache").insert(config).run();
  }

  // todo sort
  async insertUserWarning(config: Record<string, unknown>) {
    await this.dblock;
    return this.db.table("warnings").insert(config).run();
  }
}
