const Command = require("../../structures/Command");

class pingCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["pong"],
      description: "Returns the bot's latency.",
      allowdisable: false,
    });
  }

  async run(msg) {
    const pingmsg = await this.bot.embed("🏓 Ping", `API Latency: ${msg.channel.guild.shard.latency}ms.`, msg);
    this.bot.embed.edit("🏓 Pong!", `This message took ${pingmsg.timestamp - msg.timestamp}ms.`, pingmsg);
  }
}

module.exports = pingCommand;
