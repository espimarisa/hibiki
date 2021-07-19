import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class ShuffleCommand extends Command {
  description = "Shuffles the music queue.";
  cooldown = 5000;
  voice = true;

  async run(msg: Message<TextChannel>) {
    const player = this.bot.lavalink.manager.players.get(msg.channel.guild.id);
    if (!player?.queue?.length) return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("music.NOTHING_QUEUED"), "error");
    player.queue.shuffle();

    msg.createEmbed(`🔀 ${msg.locale("music.SHUFFLE")}`, msg.locale("music.QUEUE_SHUFFLED"));
  }
}
