const Command = require("structures/Command");

class pingCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["pong"],
      description: "Returns the bot's latency.",
      allowdisable: false,
    });
  }

  async run(msg) {
    const pingmsg = await msg.channel.createMessage(this.bot.embed("🏓 Ping", `API Latency: ${msg.channel.guild.shard.latency}ms.`));
    pingmsg.edit(this.bot.embed("🏓 Ping", `This message took ${pingmsg.timestamp - msg.timestamp}ms.`));
  }
}

module.exports = pingCommand;
