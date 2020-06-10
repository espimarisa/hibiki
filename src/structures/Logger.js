/**
 * @fileoverview Logger class
 * @description Functionality for loggers
 */

class Logging {
  constructor(db) {
    this.db = db;
  }

  // Gets logging channel/type
  async guildlogging(guild, type) {
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
