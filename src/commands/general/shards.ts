/**
 * @file Shards command
 * @description Returns info about all the bot's current shards
 */

import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class ShardsCommand extends Command {
  description = "Returns info about all the bot's current shards.";

  async run(msg: Message<TextChannel>) {
    const shardGuilds = {};
    const shardMembers = {};

    // Pushes guilds in each shard
    this.bot.guilds.forEach((guild) => {
      if (!shardGuilds[guild.shard.id]) {
        shardGuilds[guild.shard.id] = 1;
        shardMembers[guild.shard.id] = guild.memberCount;
      } else {
        shardGuilds[guild.shard.id]++;
        shardMembers[guild.shard.id] += guild.memberCount;
      }
    });

    // Sends shard info
    msg.channel.createMessage({
      embed: {
        title: `🌐 ${msg.locale("general.SHARDS")}`,
        color: msg.convertHex("general"),
        fields: this.bot.shards.map((shard) => ({
          name: `#${shard.id}`,
          value: `📡 ${shard.status}\n💬 ${shardGuilds[shard.id]}\n👥 ${shardMembers[shard.id]}`,
          inline: true,
        })),
        footer: {
          text: msg.locale("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
