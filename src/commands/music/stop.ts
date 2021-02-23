import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class StopCommand extends Command {
  description = "Stops playing any songs or videos.";
  clientperms = ["voiceConnect", "voiceSpeak"];
  cooldown = 3000;
  voice = true;

  async run(msg: Message<TextChannel>) {
    if (!this.bot.lavalink.manager.players.get(msg.channel.guild.id)) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("music.NOTHING_PLAYING"), "error");
    }

    this.bot.lavalink.manager.players.get(msg.channel.guild.id)?.destroy();
    return msg.createEmbed(`⏹ ${msg.string("music.STOPPED")}`, msg.string("music.STOPPED_PLAYING"));
  }
}
