/*
  All this does is log when connection is lost.
  Eris should handle reconnecting to the dAPI.
*/

const Event = require("../lib/structures/Event");

class disconnect extends Event {
  constructor(...args) {
    super(...args, {
      name: "disconnect",
    });
  }

  async run() {
    // Logs when Eris loses connection
    this.bot.log.error("Lost connection to Discord; Eris is attempting to reconnect...");
  }
}

module.exports = disconnect;
