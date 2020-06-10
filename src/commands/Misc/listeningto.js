const Command = require("structures/Command");

class listeningtoCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[member:member&fallback]",
      description: "Sends what a member's listening to on Spotify.",
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    const song = user.activities.find(s => s.id === "spotify:1");
    if (!song) return msg.channel.createMessage(this.bot.embed("❌ Error", `**${user.username}** isn't listening to Spotify.`, "error"));

    const fields = [];
    if (song.details) fields.push({ name: "Track", value: song.details });
    if (song.assets.large_text) fields.push({ name: "Album", value: `${song.assets.large_text}` });
    if (song.state) fields.push({ name: "Artist", value: `${song.state}` });

    msg.channel.createMessage({
      embed: {
        color: 0x1DB954,
        fields: fields,
        author: {
          icon_url: user.user.dynamicAvatarURL(null),
          name: `${user.username}'s listening to...`,
          url: `https://open.spotify.com/track/${song.sync_id}`,
        },
        thumbnail: {
          url: `https://i.scdn.co/image/${song.assets.large_image.replace("spotify:", "")}`,
        },
      },
    });
  }
}

module.exports = listeningtoCommand;
