import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class VolumeCommand extends Command {
  description = "Sets the volume of the currently playing song.";
  args = "[percentage:number]";
  aliases = ["maxvolume", "resetvolume", "vol"];
  cooldown = 10000;
  voice = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const player = this.bot.lavalink.manager.get(msg.channel.guild.id);
    if (!player) return msg.createEmbed(msg.string("global.ERROR"), msg.string("music.NOTHING_PLAYING"), "error");

    // Tells the user the current volume if no args were given
    if (!args.length) {
      return msg.createEmbed(`🔊 ${msg.string("music.VOLUME")}`, msg.string("music.VOLUME_CURRENT", { volume: player.volume.toFixed(0) }));
    }

    // Resets volume
    if (["reset", msg.string("global.RESET")].includes(args[0].toLowerCase())) {
      player.setVolume(100);
      return msg.createEmbed(`🔊 ${msg.string("music.VOLUME")}`, msg.string("music.VOLUME_RESET"));
    }

    // Gets the volume; clamps it if needed
    const number = parseInt(args[0]);
    let volume;
    if (Number.isNaN(number)) volume = 100;
    else if (number > 120) volume = 120;
    else if (number < 0) volume = 100;
    else volume = number;

    player.setVolume(volume);
    msg.createEmbed(`🔊 ${msg.string("music.VOLUME")}`, msg.string("music.VOLUME_CHANGED", { volume: volume }));
  }
}
