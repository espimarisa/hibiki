/**
 * @fileoverview Logging class
 * @description Manages loggers and their types
 */


class Logging {
  /**
   * Creates a logging function
   * @param {Function} db Main database function
   */

  constructor(db) {
    this.db = db;
  }

  /**
   * Reads the guild's logging channel for the proper type
   * @async
   *
   * @param {object} guild Discord guild object
   * @param {string} type The type of logger to check for
   */

  async guildLogging(guild, type) {
    if (type !== "eventLogging" && type !== "memberLogging" && type !== "messageLogging") type = "modLogging";
    if (!guild) return;
    const l = await this.db.table("guildcfg").get(guild.id ? guild.id : guild);
    return l ? l[type] ? l[type] : l.loggingChannel : null;
  }

  canLog() {
    return true;
  }
}

module.exports = Logging;
