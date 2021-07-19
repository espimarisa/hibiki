/**
 * @file Ping command
 * @description Returns the bot's latency
 */

import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class PingCommand extends Command {
  aliases = ["pong"];
  description = "Returns the bot's latency.";
  allowdisable = false;

  async run(msg: Message<TextChannel>) {
    const pingmsg = await msg.channel.createMessage({
      embed: {
        title: `🏓 ${msg.locale("general.PING")}`,
        description: msg.locale("general.PING_INITIAL_DESCRIPTION", { latency: msg.channel.guild.shard.latency }),
        color: msg.convertHex("general"),
        footer: {
          text: msg.locale("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            extra: `${msg.locale("global.LATENCY")}: ${msg.channel.guild.shard.latency}ms`,
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });

    pingmsg.edit({
      embed: {
        title: `🏓 ${msg.locale("general.PONG")}`,
        description: msg.locale("general.PING_LATENCY", { latency: pingmsg.timestamp - msg.timestamp }),
        color: msg.convertHex("general"),
        footer: {
          text: msg.locale("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            extra: `${msg.locale("global.LATENCY")}: ${msg.channel.guild.shard.latency}ms`,
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
