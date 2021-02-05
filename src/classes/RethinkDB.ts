/**
 * @file RethinkDB
 * @description Handles all RethinkDB functionality and functions
 */

import { r } from "rethinkdb-ts";
import { setupRethink } from "../scripts/setup";
import { logger } from "../utils/logger";
import config from "../../config.json";

// Starts RethinkDB
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

  // Replaces a guild's config
  async replaceGuildConfig(guild: string, config: GuildConfig) {
    await this.dblock;
    return this.db.table("guildconfig").get(guild).replace(config).run();
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

  // Replaces a user's config
  async replaceUserConfig(user: string, config: UserConfig) {
    await this.dblock;
    return this.db.table("userconfig").get(user).replace(config).run();
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
   * Warning functions
   */

  // Gets guild warnings
  async getAllGuildWarnings(guild: string) {
    await this.dblock;
    return this.db.table("warnings").filter({ guild: guild }).run() as Promise<UserWarning[]>;
  }

  // Gets a warning
  async getUserWarning(warning: string) {
    await this.dblock;
    return this.db.table("warnings").get(warning).run() as Promise<UserWarning>;
  }

  // Gets user's warnings
  async getAllUserWarnings(user: string) {
    await this.dblock;
    return this.db.table("warnings").filter({ receiver: user }).run() as Promise<UserWarning[]>;
  }

  // Gets user's guild warnings
  async getAllUserGuildWarnings(user: string, guild: string) {
    await this.dblock;
    return this.db.table("warnings").filter({ receiver: user, guild: guild }).run() as Promise<UserWarning[]>;
  }

  // Inserts a user warning
  async insertUserWarning(warning: UserWarning) {
    await this.dblock;
    return this.db.table("warnings").insert(warning).run();
  }

  // Deletes a user warning
  async deleteUserWarning(user: string, id: string) {
    await this.dblock;
    return this.db.table("warnings").filter({ receiver: user, id: id }).delete().run();
  }

  /**
   * Point functions
   */

  // Gets all points from a guild
  async getAllGuildPoints(guild: string) {
    await this.dblock;
    return this.db.table("points").filter({ guild: guild }).run() as Promise<UserPoint[]>;
  }

  // Gets a point
  async getUserPoint(point: string) {
    await this.dblock;
    return this.db.table("points").get(point).run() as Promise<UserPoint>;
  }

  // Gets all points from a user
  async getAllUserPoints(user: string) {
    await this.dblock;
    return this.db.table("points").filter({ receiver: user }).run() as Promise<UserPoint[]>;
  }

  // Gets user's points
  async getAllUserGuildPoints(user: string, guild: string) {
    await this.dblock;
    return this.db.table("points").filter({ receiver: user, guild: guild }).run() as Promise<UserPoint[]>;
  }

  // Inserts a user point
  async insertUserPoint(point: UserPoint) {
    await this.dblock;
    return this.db.table("points").insert(point).run();
  }

  // Deletes a user warning
  async deleteUserPoint(user: string, id: string) {
    await this.dblock;
    return this.db.table("points").filter({ receiver: user, id: id }).delete().run();
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
   * Reminder functions
   */

  // Gets all reminders
  async getAllReminders() {
    await this.dblock;
    return this.db.table("reminders").run();
  }

  // Gets a user's reminders
  async getAllUserReminders(user: string) {
    await this.dblock;
    return this.db.table("reminders").filter({ user: user }).run() as Promise<Reminder[]>;
  }

  // Creates a reminder
  async insertUserReminder(reminder: Reminder) {
    await this.dblock;
    return this.db.table("reminders").insert(reminder).run();
  }

  // Deletes a user's reminder
  async deleteUserReminder(user: string, reminder: string) {
    await this.dblock;
    return this.db.table("reminders").filter({ id: reminder, user: user }).delete().run();
  }

  /**
   * Marriage functions
   */

  // Gets full marriage state
  async getMarriageState(user: string, member: string) {
    await this.dblock;
    return this.db.table("marriages").getAll(user, member, { index: "marriages" }).run() as Promise<UserMarriage[]>;
  }

  // Gets a single user's marriage state
  async getUserMarriage(user: string) {
    await this.dblock;
    return this.db.table("marriages").getAll(user, { index: "marriages" }).run() as Promise<UserMarriage[]>;
  }

  // Inserts a marriage
  async insertUserMarriage(user: string, member: string) {
    await this.dblock;
    return this.db.table("marriages").insert({ id: user, spouse: member }).run();
  }

  // Deletes a marriage
  async deleteUserMarriage(user: string) {
    await this.dblock;
    return this.db.table("marriages").get(user).delete().run();
  }

  /**
   * Monitoring functions
   */

  // Gets all monitored accounts from a user
  async getAllUserMonitoring(user: string) {
    await this.dblock;
    return this.db.table("monitoring").filter({ user: user }).run() as Promise<SteamMonitor[]>;
  }

  // Gets a monitor
  async getUserMonitoring(user: string, id: string) {
    await this.dblock;
    return this.db.table("monitoring").filter({ user: user, id: id }).run() as Promise<SteamMonitor>;
  }

  // Deletes a monitor
  async deleteUserMonitoring(user: string, id: string) {
    await this.dblock;
    return this.db.table("monitoring").filter({ id: id, user: user }).delete().run();
  }

  // Inserts a monitor
  async insertUserMonitoring(user: string, data: SteamMonitor) {
    await this.dblock;
    return this.db.table("monitoring").insert({ user: user, data }).run();
  }

  /**
   * Mute cache functions
   */

  // Gets all muteCache data from a guild
  async getGuildMuteCache(guild: string) {
    await this.dblock;
    return this.db.table("mutecache").filter({ guild: guild }).run() as Promise<MuteCache[]>;
  }

  // Gets mutecache data that includes a user
  async getUserMuteCache(user: string) {
    await this.dblock;
    return this.db.table("mutecache").filter({ member: user }).run() as Promise<MuteCache[]>;
  }

  // Inserts muteCache
  async insertMuteCache(config: MuteCache) {
    await this.dblock;
    return this.db.table("mutecache").insert(config).run();
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
  async insertBlacklistedItem(item: BlacklistInfo) {
    await this.dblock;
    return this.db.table("blacklist").insert(item).run();
  }

  // Deletes a blacklisted item
  async deleteBlacklistedItem(item: string) {
    await this.dblock;
    return this.db.table("blacklist").get(item).delete().run();
  }
}
