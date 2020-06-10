const Command = require("structures/Command");

class shuffleCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["q"],
      description: "Shuffles the music queue.",
      cooldown: 5,
    });
  }

  async run(msg) {
    if (!this.bot.music.queues[msg.channel.guild.id]) return msg.channel.createMessage("no songs");
    const queue = this.bot.music.queues[msg.channel.guild.id].queue;
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    console.log(queue);
    this.bot.music.queues[msg.channel.guild.id].queue = queue;
  }
}

module.exports = shuffleCommand;
