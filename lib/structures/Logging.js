class Logging {
  constructor(db) {
    this.db = db;
  }

  // Gets logging channel/type
  async guildlogging(guild, type) {
    if (type !== "guildLogging" && type !== "modLogging" && type !== "messageLogging") type = "guildLogging";
    const l = await this.db.table("guildcfg").get(guild.id ? guild.id : guild);
    return l ? l[type] ? l[type] : l.loggingChannel : null;
  }

  async canLog() {
    return true;
  }
}

module.exports = Logging;
