/**
 * @file RethinkDB
 * @description Handles all RethinkDB functionality and functions
 */

import { r } from "rethinkdb-ts";
import { setupRethink } from "../scripts/setup";
import { logger } from "../utils/logger";
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
startRethink()
  .catch((err) => {
    logger.error(`RethinkDB failed to start. Be sure the config file is setup properly and that it's running. Exiting. (error: ${err})`);
    process.exit(1);
  })

  .then(async () => {
    await setupRethink();
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
  async getGuildConfig(guild: string) {
    await this.dblock;
    return this.db.table("guildconfig").get(guild).run() as Promise<GuildConfig>;
  }

  // Updates a guild's config
  async updateGuildConfig(guild: string, config: GuildConfig) {
    await this.dblock;
    return this.db.table("guildconfig").get(guild).update(config).run();
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
  async getUserConfig(user: string) {
    await this.dblock;
    return this.db.table("userconfig").get(user).run() as Promise<UserConfig>;
  }

  // Updates a user's config
  async updateUserConfig(user: string, config: UserConfig) {
    await this.dblock;
    return this.db.table("userconfig").get(user).update(config).run();
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

  // Gets user mute cache
  async getUserMuteCache(member: string) {
    await this.dblock;
    return this.db.table("mutecache").filter({ member: member }).run() as Promise<MuteCache>;
  }

  // Gets guild muteCache
  async getGuildMuteCache(guild: string) {
    await this.dblock;
    return this.db.table("mutecache").filter({ guild: guild }).run() as Promise<MuteCache>;
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

  // Gets guild warnings
  async getGuildWarnings(guild: string) {
    await this.dblock;
    return this.db.table("warnings").filter({ guild: guild }).run() as Promise<UserWarning>;
  }

  // Gets user's warnings
  async getUserWarnings(user: string) {
    await this.dblock;
    return this.db.table("warnings").filter({ receiver: user }).run();
  }

  /**
   * Point functions
   */

  async getGuildPoints(guild: string) {
    await this.dblock;
    return this.db.table("points").filter({ guild: guild }).run();
  }

  async getUserPoints(user: string) {
    await this.dblock;
    return this.db.table("points").filter({ receiver: user }).run();
  }

  /**
   * Economy functions
   */

  // Gets user cookies
  async getUserCookies(user: string) {
    await this.dblock;
    return this.db.table("economy").get(user).run() as Promise<UserCookies>;
  }

  // Updates user cookies
  async updateUserCookies(user: string, cookies: UserCookies) {
    await this.dblock;
    return this.db.table("economy").get(user).update(cookies).run();
  }

  // Inserts blank amount of user cookies
  async insertBlankUserCookies(user: string) {
    await this.dblock;
    return this.db.table("economy").insert({ id: user, amount: 0, lastclaim: null }).run();
  }

  /**
   * Blacklist functions
   */

  // Gets entire blacklist
  async getBlacklist() {
    await this.dblock;
    return this.db.table("blacklist").run();
  }

  // Gets a blacklisted guild
  async getBlacklistedGuild(guild: string) {
    await this.dblock;
    return this.db.table("blacklist").filter({ id: guild, guild: true }).run();
  }

  // Gets a blacklisted user
  async getBlacklistedUser(user: string) {
    await this.dblock;
    return this.db.table("blacklist").filter({ id: user, user: true }).run();
  }

  // Inserts a blacklisted item
  async insertBlacklistedItem(id: BlacklistInfo) {
    await this.dblock;
    return this.db.table("blacklist").insert(id).run();
  }

  // Deletes a blacklisted item
  async deleteBlacklistedItem(item: string) {
    await this.dblock;
    return this.db.table("blacklist").get(item).delete().run();
  }

  /**
   * Reminder functions
   */

  // Gets all reminders
  async getAllReminders() {
    await this.dblock;
    return this.db.table("reminders").run();
  }

  // Gets a user's reminders
  async getUserReminders(user: string) {
    await this.dblock;
    return (this.db.table("reminders").filter({ user: user }).run() as unknown) as Array<Reminder>;
  }

  // Creates a reminder
  async insertUserReminder(reminder: Reminder) {
    await this.dblock;
    return this.db.table("reminders").insert(reminder).run();
  }

  // Deletes a user's reminder
  async deleteUserReminder(reminder: string, user: string) {
    await this.dblock;
    return this.db.table("reminders").filter({ id: reminder, user: user }).delete().run();
  }

  /**
   * Marriage functions
   */

  async getUserMarriage(user: string) {
    await this.dblock;
    // no fucking clue but this should work!
    await this.db.table("marriages").getAll(user, { index: "marriages" }).run();
  }

  /**
   * Monitoring functions
   */

  async getUserMonitoring(user: string) {
    await this.dblock;
    return this.db.table("monitoring").filter({ user: user }).run();
  }
}
