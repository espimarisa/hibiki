/**
 * @file RethinkDB Provider
 * @description Main database provider for RethinkDB
 * @author Espi <contact@espi.me>
 */

import { DatabaseProvider } from "../structures/Database";
import { r } from "rethinkdb-ts";
import { hibikiClient } from "../structures/Client";
import config from "../../config.json";

const rethinkOptions = {
  db: config.database.db,
  // password: config.database.password,
  // port: config.database.port,
  // host: config.database.host,
  // user: config.database.user,
  silent: true,
};

async function startRethink() {
  await r.connectPool(rethinkOptions);
}

startRethink();

export class RethinkProvider extends DatabaseProvider {
  db: typeof r;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dblock: any;

  constructor(bot: hibikiClient) {
    super(bot);
    this.db = r;
    this.dblock = this.db.db(rethinkOptions.db).wait();
  }

  /**
   * Return's a guild's config
   * @param guild The guild ID to search
   *
   * @example getGuildConfig(msg.channel.guild.id);
   */

  async getGuildConfig(guild: string): Promise<unknown> {
    await this.dblock;
    return this.db.table("guildconfig").get(guild).run();
  }

  /**
   * Returns a user's profile config
   * @param {string} user The user ID to search
   *
   * @example getUserConfig(msg.author.id);
   */

  async getUserConfig(user: string): Promise<unknown> {
    await this.dblock;
    return this.db.table("userconfig").get(user).run();
  }
}
