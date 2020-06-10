/**
 * @fileoverview Music class
 * @description Functionality for music commands
 */

const fetch = require("node-fetch");
const ytdl = require("ytdl-core");

class Music {
  constructor(bot) {
    this.bot = bot;
    this.queues = {};
  }

  // Searches on YouTube
  async search(query) {
    let body = await fetch(`https://www.googleapis.com/youtube/v3/search?type=video&part=id,snippet&q=${encodeURIComponent(query)}&key=${this.bot.key.youtube}`, {
      headers: {
        Accept: "application/json",
      },
    });
    body = await body.json();
    console.log(body.items[0].snippet);
    return body;
  }

  // Add to queue function
  addtoqueue(url, channel, textchannel, guild, snippet) {
    if (!this.queues[guild]) {
      this.queues[guild] = {
        channel: channel,
        guild: guild,
        queue: [{ url: url, snippet: snippet }],
        textchannel: textchannel,
      };
    } else {
      this.queues[guild].channel = channel;
      this.queues[guild].queue.push({ url: url, snippet: snippet });
    }
  }

  // Play function
  async play(gid) {
    if (!this.queues[gid].queue.length) return;
    if (!this.queues[gid].connection) this.queues[gid].connection = await this.queues[gid].channel.join();
    const q = this.queues[gid];
    const stream = ytdl(q.queue[0].url, {
      filter: "audioonly",
    });

    // Send when a song is playing
    q.textchannel.createMessage({
      embed: {
        title: `🎶 Playing ${q.queue[0].snippet.title}`,
        description: `Uploaded by ${q.queue[0].snippet.channelTitle}`,
        color: this.bot.embed.color("general"),
        thumbnail: {
          url: q.queue[0].snippet.thumbnails.high.url,
        },
      },
    });

    // Plays the stream
    await q.connection.play(stream, { voiceDataTimeout: 10000 });
    q.connection.on("end", () => {
      this.queues[gid].queue.shift();
      this.play(q.guild);
    });
  }
}

module.exports = Music;
