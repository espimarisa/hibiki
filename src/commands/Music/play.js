const Command = require("structures/Command");
const Wait = require("utils/WaitFor");

class playCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[url:string]",
      aliases: ["youtube"],
      description: "Plays a song from a YouTube URL.",
      cooldown: 5,
    });
  }

  async run(msg, args) {
    // Searches for the song
    const res = await this.bot.music.search(args.join(" "));
    res.items = res.items.splice(0, 5);

    if (!msg.member.voiceState.channelID) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "You aren't in a voice channel.", "error"));
    }

    const omsg = await msg.channel.createMessage({
      embed: {
        title: "🎵 Respond with the desired song",
        description: res.items.map((vid, i) => `**${i + 1}**: ${vid.snippet.title}`).join("\n"),
        color: this.bot.embed.color("general"),
      },
    });

    let vid;
    // Waits for the list of songs
    await Wait("messageCreate", 60000, async (m) => {
      if (m.author.id !== msg.author.id) return;
      if (m.channel.id !== msg.channel.id) return;
      if (!m.content) return;
      // Gets the videos
      let tvid = res.items[parseInt(m.content) - 1];
      if (!tvid) tvid = res.items.find(r => r.snippet.title.toLowerCase().startsWith(m.content));

      // If video not found
      if (!tvid) {
        await omsg.edit(this.bot.embed("❌ Error", "Video not found.", "error"));
        return true;
      }
      vid = tvid;
      return true;
    }, this.bot).catch(e => e === "timeout" ? omsg.edit(this.bot.embed("❌ Error", "Timeout reached, exiting.", "error")) : "");
    if (!vid) return;

    // If a member leaves after picking a song
    if (!msg.member.voiceState.channelID) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "You aren't in a voice channel.", "error"));
    }

    // Adds the song to the queue
    this.bot.music.addtoqueue(`https://www.youtube.com/watch?v=${vid.id.videoId}`, msg.channel.guild.channels.get(msg.member.voiceState.channelID),
      msg.channel, msg.channel.guild.id, vid.snippet, msg.author);
    if (!this.bot.music.queues[msg.channel.guild.id] || !this.bot.music.queues[msg.channel.guild.id].connection) {
      console.log("i like cats");
      this.bot.music.play(msg.channel.guild.id);
      console.log(this.bot.music.queues[msg.channel.guild.id].connection);
    }
    await omsg.edit({
      embed: {
        title: `🎶 Selected ${vid.snippet.title}`,
        description: `Uploaded by ${vid.snippet.channelTitle}`,
        color: this.bot.embed.color("general"),
        thumbnail: {
          url: vid.snippet.thumbnails.high.url,
        },
      },
    });
  }
}

module.exports = playCommand;
