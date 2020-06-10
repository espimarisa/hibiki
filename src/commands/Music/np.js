const Command = require("structures/Command");

class npCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["nowplaying", "playing"],
      description: "Tells what song is currently playing.",
    });
  }

  async run(msg) {
    if (!this.bot.music.queues[msg.channel.guild.id] || !this.bot.music.queues[msg.channel.guild.id].queue[0]) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "No song is playing.", "error"));
    }

    const song = this.bot.music.queues[msg.channel.guild.id].currentSong.snippet;

     msg.channel.createMessage({
      embed: {
        title: `🎶 Playing ${song.title}`,
        color: this.bot.embed.color("general"),
        thumbnail: {
          url: song.thumbnails.high.url,
        },
      },
    });
  }
}

module.exports = npCommand;
