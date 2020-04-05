const Command = require("../../lib/structures/Command");

class pingCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["pig", "pingpong", "pog", "pong"],
      description: "Shows the bot's ping & latency.",
      allowdisable: false,
    });
  }

  async run(msg) {
    // Sends the original latency message
    let message = await msg.channel.createMessage(this.bot.embed("🏓 Ping", `API Latency: ${msg.channel.guild.shard.latency}ms`, "general"));
    // Edits the message
    message.edit({
      embed: {
        title: "🏓 Ping",
        description: `This message took ${message.timestamp - msg.timestamp}ms.`,
        color: this.bot.embed.colour("general"),
      }
    });
  }
}

module.exports = pingCommand;
