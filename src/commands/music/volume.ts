import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class VolumeCommand extends Command {
  description = "Sets the volume of the currently playing song.";
  args = "[percentage:string]";
  aliases = ["maxvolume", "resetvolume", "vol"];
  cooldown = 10000;
  voice = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs, args: string[]) {
    const player = this.bot.lavalink.manager.get(msg.channel.guild.id);
    if (!player) return msg.createEmbed(msg.string("global.ERROR"), msg.string("music.NOTHING_PLAYING"), "error");

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
