/**
 * @fileoverview Event class
 * @description Manages events and their parameters
 */

class Event {
  /**
   * Creates an event
   * @param {object} bot Main bot object
   * @param {string} id The event's id, inherited from it's filename
   * @param {object} params The event's paramaters
   */

  constructor(bot, id, params) {
    this.bot = bot;
    this.id = id;
    this.name = params.name || this.id;
  }
}

module.exports = Event;
