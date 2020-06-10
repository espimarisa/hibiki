/**
 * @fileoverview Event class
 * @description Sets Event paramaters
 */

class Event {
  constructor(bot, id, params) {
    this.bot = bot;
    this.id = id;
    this.name = params.name || this.id;
  }
}

module.exports = Event;
