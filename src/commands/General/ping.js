const Command = require("../../lib/structures/Command");

class pingCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["pig", "pingpong", "pog", "pong"],
      description: "Checks the bot's ping.",
      allowdisable: false,
    });
  }

  async run(msg) {
    let message = await msg.channel.createMessage(this.bot.embed("🏓 Ping", `API Latency: ${msg.channel.guild.shard.latency}ms`, "general"));
    message.edit(this.bot.embed("🏓 Ping", `This message took ${message.timestamp - msg.timestamp}ms.`, "general"));
  }
}

module.exports = pingCommand;
