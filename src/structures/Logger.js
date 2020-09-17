/**
 * @fileoverview Logging class
 * @description Manages loggers and their types
 */

class Logging {
  /**
   * Creates a logging function
   * @param {Function} db Main database function
   */

  constructor(db, id) {
    this.db = db;
    this.id = id;
  }

  /**
   * Reads the guild's logging channel for the proper type
   * @async
   *
   * @param {object} guild Discord guild object
   * @param {string} type The type of logger to check for
   */

  async guildLogging(guild, type, evchannel) {
    if (type !== "eventLogging" && type !== "memberLogging" && type !== "messageLogging") type = "modLogging";
    if (!guild) return;

    const guildconfig = await this.db.table("guildconfig").get(guild.id ? guild.id : guild).run();
    if (!guildconfig) return null;

    // Ignores channels set to be ignored
    if (guildconfig.ignoredLoggingChannels && guildconfig.ignoredLoggingChannels.includes(evchannel)) return null;
    return type ? guildconfig[type] : guildconfig.loggingChannel;
  }

  /**
   * Tells if a channel can be logged to
   */
  canLog() {
    return true;
  }
}

module.exports = Logging;
