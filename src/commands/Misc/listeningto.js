const Command = require("structures/Command");

class listeningtoCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<member:member&fallback>",
      description: "Sends what a member's listening to on Spotify.",
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    if (!user.activities) return this.bot.embed("❌ Error", `**${user.username}** isn't listening to spotify.`, msg, "error");
    const song = user.activities.find(s => s.id === "spotify:1");
    if (!song) return this.bot.embed("❌ Error", `**${user.username}** isn't listening to Spotify.`, msg, "error");

    const fields = [];
    if (song.details) fields.push({ name: "Track", value: song.details });
    if (song.assets.large_text) fields.push({ name: "Album", value: `${song.assets.large_text}` });
    if (song.state) fields.push({ name: "Artist", value: `${song.state}` });

    msg.channel.createMessage({
      embed: {
        color: 0x1ED760,
        fields: fields,
        author: {
          icon_url: user.user.dynamicAvatarURL(null),
          name: `${user.username}'s listening to...`,
          url: `https://open.spotify.com/track/${song.sync_id}`,
        },
        thumbnail: {
          url: `https://i.scdn.co/image/${song.assets.large_image.replace("spotify:", "")}`,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = listeningtoCommand;
