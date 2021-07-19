/**
 * @file Shard command
 * @description Tells you what shard the current server is in
 */

import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class ShardCommand extends Command {
  description = "Tells you what shard the current server is in.";

  async run(msg: Message<TextChannel>) {
    msg.createEmbed(
      `🌐 ${msg.locale("general.SHARD")}`,
      msg.locale("general.SHARD_CURRENT", {
        guild: msg.channel.guild.name,
        shard: msg.channel.guild.shard.id,
      }),
    );
  }
}
