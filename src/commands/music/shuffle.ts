import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class ShuffleCommand extends Command {
  description = "Shuffles the music queue.";
  cooldown = 5000;
  voice = true;

  async run(msg: Message<TextChannel>) {
    const player = this.bot.lavalink.manager.players.get(msg.channel.guild.id);
    if (!player) return msg.createEmbed(msg.string("global.ERROR"), msg.string("music.NOTHING_PLAYING"), "error");
    player.queue.shuffle();

    msg.createEmbed(`🔀 ${msg.string("music.SHUFFLE")}`, msg.string("music.QUEUE_SHUFFLED"));
  }
}
