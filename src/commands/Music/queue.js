const Command = require("structures/Command");
const format = require("utils/format");

class queueCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["q"],
      description: "Shows what songs are currently queueeeed.",
      cooldown: 5,
    });
  }

  async run(msg) {
    if (!this.bot.music.queues[msg.channel.guild.id])
      return msg.channel.createMessage("no songs");
    msg.channel.createMessage(
      this.bot.embed("Queue", this.bot.music.queues[msg.channel.guild.id].queue.map((a) => `${a.snippet.title} requested by ${format.tag(a.requestedBy, false)}`).join("\n")),
    );
  }
}

module.exports = queueCommand;
