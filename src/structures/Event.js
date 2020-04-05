class Event {
  constructor(bot, id, params) {
    this.bot = bot;
    this.id = id;
    this.name = params.name || this.id;
    // Unload functionality
    this.unload = () => {
      // let event = this.bot.events.get(this.id);
      return "unloaded";
    }

    // Reload functionality
    this.reload = () => {
      let event = require.cache[require.resolve(`../../events/${this.id}`)];
      // Deletes the cached event
      delete require.cache[require.resolve(`../../events/${this.id}`)];
      try {
        // Tries to load the new event
        event = require(`../../events/${this.id}`);
      } catch (err) {
        event = err.message;
        this.bot.log.error(`Error while reloading the ${this.id} event: ${err}`);
      }
      // Sends if the event failed to reload
      if (!event || typeof event == "string") return Error(typeof event == "string" ? event : `Error while reloading ${this.id}`);
      event = new event(this.bot, this.id);
      // Runs each event
      let eevent = (arg1, arg2, arg3, arg4, arg5) => { event.run(arg1, arg2, arg3, arg4, arg5) };
      bot.removeListener(event.name, eevent);
      this.bot.on(event.name, eevent);
      return "reloaded";
    }
  }
}

module.exports = Event;
