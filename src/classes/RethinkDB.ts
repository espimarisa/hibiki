/**
 * @file RethinkDB Provider
 * @description Main database provider for RethinkDB
 */

import { botLogger } from "../helpers/logger";
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
  botLogger.error(`RethinkDB failed to start. Be sure the config file is setup properly and that it's running. Exiting. (error: ${err})`);
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

  async updateGuildConfig(config: any) {
    await this.dblock;
    return this.db.table("guildconfig").update(config).run();
  }

  async getMuteCache() {
    await this.dblock;
    return this.db.table("mutecache").run();
  }
}
