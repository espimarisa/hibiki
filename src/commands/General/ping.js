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
    let pingmsg = await msg.channel.createMessage(this.bot.embed("🏓 Ping", `API Latency: ${msg.channel.guild.shard.latency}ms`));
    pingmsg.edit(this.bot.embed("🏓 Ping", `This message took ${pingmsg.timestamp - msg.timestamp}ms.`));
  }
}

module.exports = pingCommand;
