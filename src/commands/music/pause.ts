import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class PauseCommand extends Command {
  description = "Pauses the currently playing song.";
  aliases = ["resume"];
  clientperms = ["voiceConnect", "voiceSpeak"];
  cooldown = 5000;
  voice = true;

  async run(msg: Message<TextChannel>) {
    const player = this.bot.lavalink.manager.players.get(msg.channel.guild.id);

    // If nothing is playing
    if (!player?.queue?.current) {
      return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("music.NOTHING_PLAYING"), "error");
    }

    // Resumes if paused
    if (player.paused) {
      player.pause(false);
      return msg.createEmbed(`▶ ${msg.locale("music.RESUMED")}`, msg.locale("music.PAUSE_RESUMED", { track: player.queue.current?.title }));
    }

    // Pauses the song
    player.pause(true);
    return msg.createEmbed(
      `⏸ ${msg.locale("music.PAUSED")}`,
      msg.locale("music.PAUSE_PAUSED", {
        track: player.queue.current?.title,
      }),
    );
  }
}
