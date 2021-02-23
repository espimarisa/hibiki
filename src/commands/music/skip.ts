import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class SkipCommand extends Command {
  description = "Skips the currently phlaying song.";
  voice = true;

  async run(msg: Message<TextChannel>) {
    const player = this.bot.lavalink.manager.players.get(msg.channel.guild.id);
    if (!player) return msg.createEmbed(msg.string("global.ERROR"), msg.string("music.NOTHING_PLAYING"), "error");
    const queueRepeat = player.queueRepeat;

    // HACK: Stop repeating if the song was being repeated
    player.setTrackRepeat(false);
    player.setQueueRepeat(queueRepeat);
    player.stop();

    if (player.queue?.length === 0) return;

    // Sends when the track is skipped
    msg
      .createEmbed(`🎶 ${msg.string("music.SKIPPED")}`, msg.string("music.SKIP_DESCRIPTION", { title: player.queue.current?.title }))
      .then((m) => {
        setTimeout(() => {
          m.delete();
        }, 10000);
      });
  }
}
