const Command = require("../../lib/structures/Command");

class skipCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[url:string]",
      description: "Skips a currently playing song.",
      cooldown: 5,
    });
  }

  async run(msg) {
    if (!this.bot.music.queues[msg.channel.guild.id] || !this.bot.music.queues[msg.channel.guild.id].queue[0]) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "No song is playing.", "error"));
    }

    this.bot.music.queues[msg.channel.guild.id].connection.stopPlaying();
    this.bot.music.queues[msg.channel.guild.id].queue.shift();
    msg.channel.createMessage(this.bot.embed("🎶 Skip", `Song skipped by **${msg.author.username}**.`));
  }
}

module.exports = skipCommand;
