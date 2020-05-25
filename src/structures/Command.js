const sentry = require("@sentry/node");

class Command {
  constructor(bot, category, id, params) {
    this.bot = bot;
    this.category = category;
    this.id = id;
    if (params) {
      this.aliases = params.aliases ? params.aliases : [];
      this.allowdisable = params.allowdisable === undefined ? true : params.allowdisable;
      this.allowdms = params.allowdms ? params.allowdms : false;
      this.args = params.args;
      this.argsDelimiter = params.argsDelimiter || " ";
      this.clientperms = params.clientperms || "embedLinks";
      this.cooldown = params.cooldown;
      this.description = params.description;
      this.nsfw = params.nsfw ? params.nsfw : false;
      this.owner = params.owner ? params.owner : false;
      this.requiredkeys = params.requiredkeys ? params.requiredkeys : [];
      this.requiredperms = params.requiredperms;
      this.staff = params.staff ? params.staff : false;
    }

    // Unload handler
    this.unload = () => {
      this.bot.commands.delete(id);
      return "unloaded";
    };

    // Reload handler
    this.reload = () => {
      let command = bot.commands.find(c => c.id === this.id);
      // Deletes the cached command
      delete require.cache[require.resolve(`../../cmds/${this.category}/${this.id}`)];
      try {
        command = require(`../../cmds/${this.category}/${this.id}`);
      } catch (e) {
        command = e;
        sentry.captureException(e);
        this.bot.log.error(`${this.id} was unable to be reloaded: ${e}`);
      }
      if (!command || command instanceof Error) return Error(command instanceof Error ? command : `${this.id} was unable to be reloaded`);
      this.unload();
      this.bot.commands.add(new command(this.bot, this.category, this.id));
      return "reloaded";
    };
  }
}

module.exports = Command;
