import type { EmbedOptions, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { pagify } from "../../utils/pagify";
const pageSize = 2;

export class QueueCommand extends Command {
  description = "Returns the next 10 queued songs.";
  aliases = ["q"];
  cooldown = 5000;
  voice = true;

  async run(msg: Message<TextChannel>) {
    const player = this.bot.lavalink.manager.get(msg.channel.guild.id);
    if (!player?.queue?.length) return msg.createEmbed(msg.string("global.ERROR"), msg.string("music.NOTHING_QUEUED"), "error");

    // Pagifies if the queue length is bigger than the page size
    if (player.queue.length > pageSize) {
      const pages: EmbedOptions[] = [];
      for (let i = 0; i < player.queue.length / pageSize; i++) {
        pages.push({
          title: `🎶 ${msg.string("music.QUEUE")}`,
          description: player.queue
            .slice(i * pageSize, pageSize + i * pageSize)
            .map((t) => t.title)
            .join("\n"),
          color: msg.convertHex("general"),
        });
      }

      // Sends the original message and pagifies it
      pagify(
        pages,
        msg.channel,
        this.bot,
        msg.author.id,
        { title: `⏹ ${msg.string("music.EXITED_QUEUE")}`, color: msg.convertHex("general") },
        false,
        msg.string("global.RAN_BY", { author: msg.tagUser(msg.author), extra: `%c/%a` }),
        msg.author.dynamicAvatarURL(),
      );
    } else if (player.queue.length === 0) {
      // Runs the nowplaying command if queue length is 0
      this.bot.commands.find((cmd) => cmd.name === "nowplaying")?.run(msg);
    } else {
      // Sends if there's less than the max pageSize
      const tracks = player.queue.slice(0, pageSize);
      msg.createEmbed(`⏯ ${msg.string("music.QUEUE")}`, tracks.map((t) => t.title).join("\n"));
    }
  }
}
