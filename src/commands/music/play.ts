import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { timeoutHandler, waitFor } from "../../utils/waitFor";
const maxResults = 5;

export class PlayCommand extends Command {
  description = "Puts a requested song or video in the queue to be played.";
  clientperms = ["voiceConnect", "voiceSpeak"];
  args = "<url:string>";
  cooldown = 3000;
  voice = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    // Creates a player
    const query = args.join(" ");

    // FIXME: This sometimes breaks? This is 100% due to intents being dogshit. Not our problem...
    const voiceChannel = msg.channel.guild.members.get(msg.author.id)?.voiceState?.channelID;
    const player = this.bot.lavalink.manager.create({
      guild: msg.channel.guild.id,
      textChannel: msg.channel.id,
      voiceChannel: voiceChannel,
    });

    // Searches for the query
    const res = await this.bot.lavalink.manager.search({ query: query }, msg.author);
    player.connect();

    // Handles exceptions
    if (!res || res?.exception?.message) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("music.PLAY_RESERROR", { error: res.exception?.message }), "error");
    }

    // Handles search results
    switch (res.loadType) {
      case "SEARCH_RESULT": {
        let tracks;

        // Removes tracks longer than maxlength
        if (this.bot.config.lavalink.maxlength) {
          tracks = res.tracks.filter((track) => track.duration < this.bot.config.lavalink.maxlength);
        } else {
          tracks = res.tracks;
        }

        // Cleans up the results and sends the initial embed
        const results = tracks.slice(0, tracks.length < maxResults ? tracks.length : maxResults);
        const resultMsg = await msg.createEmbed(
          `🔎 ${msg.string("music.SEARCH")}`,
          msg.string("music.SEARCH_RESULTS", { results: results.map((r, i) => `**${i + 1}** - ${r.title}`).join("\n") }),
        );

        // Sends the search results and waits for input
        let invalidSong = false;
        let song = (await waitFor(
          "messageCreate",
          15000,
          async (m: Message) => {
            if (m.author.id !== msg.author.id) return;
            else if (m.channel.id !== msg.channel.id) return;
            else if (!m.content) return;
            else if (m.content.toLowerCase() === "stop" || m.content.toLowerCase() === "cancel") invalidSong = true;
            else if (parseInt(m.content) > maxResults) invalidSong = true;
            else if (isNaN(parseInt(m.content))) return;
            return true;
          },
          this.bot,
        ).catch((err) => timeoutHandler(err, resultMsg, msg.string))) as any;

        // Handles invalid songs
        if (invalidSong) return resultMsg.editEmbed(msg.string("global.ERROR"), msg.string("music.INVALID_SONG"), "error");
        if (!song || !song[0] || !song[0].content) return;

        // Sets the song
        song = parseInt(song[0].content);
        if (Number.isNaN(song)) return;
        if (song <= 0) song = 1;
        if (song >= maxResults) song = maxResults;
        if (!tracks[song]) return;

        // Prevents songs that are over the max length from playing
        if (!!this.bot.config.lavalink.maxlength && tracks?.[song - 1].duration > this.bot.config.lavalink.maxlength) {
          return msg.createEmbed(
            msg.string("global.ERROR"),
            msg.string("music.TOO_LONG", { limit: this.bot.config.lavalink.maxlength / 60000 }),
            "error",
          );
        }

        // Adds the song to the queue
        player.queue.add(tracks[song - 1]);

        if (player.queue?.length > 0) {
          msg.createEmbed(`🎶 ${msg.string("music.ADDED")}`, msg.string("music.ADDED_TO_QUEUE", { track: tracks[song - 1].title }));
        }

        if (!player.playing && !player.paused && !player.queue.length) player.play();
        break;
      }

      // If nothing was found
      case "NO_MATCHES": {
        if (!player.queue.current) player.destroy();
        msg.createEmbed(msg.string("global.ERROR"), msg.string("music.NO_MATCHES"), "error");
        break;
      }

      // If something failed to load
      case "LOAD_FAILED": {
        msg.createEmbed(msg.string("global.ERROR"), msg.string("music.LOADFAILED"), "error");
        break;
      }

      // Handles track loading
      case "TRACK_LOADED": {
        // Prevents songs that are over the max length from playing
        if (!!this.bot.config.lavalink.maxlength && res.tracks[0].duration > this.bot.config.lavalink.maxlength) {
          return msg.createEmbed(
            msg.string("global.ERROR"),
            msg.string("music.TOO_LONG", { limit: this.bot.config.lavalink.maxlength / 60000 }),
            "error",
          );
        }

        // Adds the song and plays it
        player.queue.add(res.tracks[0]);
        if (!player.playing && !player.paused && !player.queue.size) player.play();
        msg.createEmbed(`🎶 ${msg.string("music.ADDED")}`, msg.string("music.ADDED_TRACK", { track: res.tracks[0].title })).then((m) => {
          setTimeout(() => {
            m?.delete();
          }, 5000);
        });

        break;
      }

      case "PLAYLIST_LOADED": {
        let songsRemoved = 0;
        const songsToQueue = res.tracks.filter((track, i) => {
          if (player.queue.size + i >= 100 || track.duration > this.bot.config.lavalink.maxlength) {
            songsRemoved++;
            return false;
          }

          return true;
        });

        // Sends if the plalyist has no valid songs
        if (!songsToQueue) return msg.createEmbed(msg.string("global.ERROR"), msg.string("music.PLAYLIST_NOTHING"), "error");

        // Plays the songs in the playlist
        player.queue.add(songsToQueue);
        if (!player.playing && !player.paused) player.play();

        // Pushes fields if any songs are removed
        const fields = [];
        if (songsRemoved > 0) {
          fields.push({
            name: msg.string("music.ITEMS_REMOVED"),
            value: `${songsRemoved}`,
          });
        }

        // Sends when a playlist is added
        msg.channel
          .createMessage({
            embed: {
              title: `🎶 ${msg.string("music.PLAYLIST_ADDED")}`,
              description: msg.string("music.ADDED_PLAYLIST", { name: res.playlist?.name, tracks: res.tracks.length }),
              color: msg.convertHex("general"),
              fields: fields,
              footer: {
                text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
                icon_url: msg.author.dynamicAvatarURL(),
              },
            },
          })
          .then((m) => {
            setTimeout(() => {
              m.delete();
            }, 10000);
          });

        break;
      }
    }
  }
}
