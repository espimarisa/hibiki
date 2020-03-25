/*
  Verniy Event Class
  © 2020 smolespi & resolved
  github.com/smolespi/Verniy
*/

class Event {
  constructor(bot, id, params) {
    this.bot = bot;
    this.id = id;
    this.name = params.name || this.id;
  }
}

module.exports = Event;
