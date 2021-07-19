import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { toHHMMSS } from "../../utils/format";

export class NowPlayingCommand extends Command {
  description = "Tells you what song is currently playing.";
  aliases = ["np", "playing"];
  cooldown = 3000;
  voice = true;

  async run(msg: Message<TextChannel>) {
    const player = this.bot.lavalink.manager.players.get(msg.channel.guild.id);
    if (!player?.queue?.current) return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("music.NOTHING_PLAYING"), "error");

    msg.channel.createMessage({
      embed: {
        title: `🎶 ${msg.locale("music.NOW_PLAYING")}`,
        description: msg.locale("music.NOW_PLAYING_INFO", {
          track: player.queue.current?.title,
          author: player.queue.current?.author,
          url: player.queue.current?.uri,
        }),
        fields: [
          {
            name: msg.locale("music.DURATION"),
            value: `${toHHMMSS(player.queue.current?.duration / 1000)}`,
            inline: true,
          },
        ],
        color: msg.convertHex("general"),
        thumbnail: {
          url: player.queue.current?.thumbnail ? player.queue.current?.thumbnail : undefined,
        },
        footer: {
          text: msg.locale("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
