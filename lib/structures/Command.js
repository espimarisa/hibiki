class Command {
  constructor(bot, category, id, params) {
    this.bot = bot;
    this.category = category;
    this.id = id;
    // Cmd params
    if (params) {
      this.aliases = params.aliases ? params.aliases : [];
      this.allowdms = params.allowdms ? params.allowdms : false;
      this.args = params.args;
      this.argsDelimiter = params.argsDelimiter || " ";
      this.clientperms = params.clientperms;
      this.cooldown = params.cooldown;
      this.nsfw = params.nsfw ? params.nsfw : false;
      this.owner = params.owner ? params.owner : false;
      this.requiredperms = params.requiredperms;
      this.staff = params.staff ? params.staff : false;
    }

    // Unload handler
    this.unload = () => {
      this.bot.commands.delete(id);
      return "unloaded";
    }

    // Reload handler
    this.reload = () => {
      let command = bot.commands.find(c => c.id == this.id);
      // Deletes the cached command
      delete require.cache[require.resolve(`../../cmds/${this.category}/${this.id}`)];
      try {
        command = require(`../../cmds/${this.category}/${this.id}`);
      } catch (err) {
        command = err;
        // Sends if a command couldn't be reloaded
        this.bot.log.error(`${this.id} was unable to be reloaded: ${err}`)
      }
      if (!command || command instanceof Error) return Error(command instanceof Error ? command : `${this.id} was unable to be reloaded`);
      // Unloads & loads
      this.unload();
      this.bot.commands.add(new command(this.bot, this.category, this.id));
      return "reloaded";
    }
  }
}

module.exports = Command;
