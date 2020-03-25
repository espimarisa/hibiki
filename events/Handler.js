const Event = require("../lib/structures/Event");

class Handler extends Event {
  constructor(...args) {
    super(...args, {
      name: "messageCreate",
    });
  }
  async run(msg) {
    // todo: not have as much stuff from v2.. clean this up, this is temporary.
    let servercfg = await this.bot.db.table("servercfg").get(msg.channel.guild.id);
    let prefixLength = null;
    if (msg.content.startsWith(this.bot.cfg.prefix) && (!servercfg || !servercfg.prefix)) prefixLength = this.bot.cfg.prefix.length;
    if (msg.content.startsWith(`<@${this.bot.user.id}>`) && !prefixLength) prefixLength = `<@${this.bot.user.id}> `.length;
    if (msg.content.startsWith(`<@!${this.bot.user.id}>`) && !prefixLength) prefixLength = `<@!${this.bot.user.id}> `.length;
    if (servercfg && servercfg.prefix && msg.content.startsWith(servercfg.prefix) && !prefixLength) prefixLength = servercfg.prefix.length;
    if (!prefixLength || prefixLength.length == 0) return;
    msg.prefix = msg.content.slice(0, prefixLength);
    const [cmdName, ...args] = msg.content.slice(prefixLength).split(" ").map(s => s.trim());
    const cmd = this.bot.commands.find(tempCmd => tempCmd.id === cmdName.toLowerCase());
    // Looks for the command
    if (!cmd) return;
    if (msg.author.bot) return;
    if (msg.content.startsWith(this.bot.cfg.prefix)) {
      try {
        await cmd.run(msg, args);
      } catch (e) {
        console.log(e);
      }
    }
  }
}

module.exports = Handler;
