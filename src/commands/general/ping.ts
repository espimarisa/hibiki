import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class PingCommand extends Command {
  aliases = ["pong"];
  description = "Returns the bot's latency.";
  allowdisable = false;

  async run(msg: Message<TextChannel>) {
    const pingmsg = await msg.channel.createMessage({
      embed: {
        title: `🏓 ${msg.string("general.PING")}`,
        description: msg.string("general.PING_INITIAL_DESCRIPTION", { latency: msg.channel.guild.shard.latency }),
        color: msg.convertHex("general"),
        footer: {
          text: msg.string("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            extra: `${msg.string("global.LATENCY")}: ${msg.channel.guild.shard.latency}ms`,
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });

    pingmsg.edit({
      embed: {
        title: `🏓 ${msg.string("general.PONG")}`,
        description: msg.string("general.PING_LATENCY", { latency: pingmsg.timestamp - msg.timestamp }),
        color: msg.convertHex("general"),
        footer: {
          text: msg.string("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            extra: `${msg.string("global.LATENCY")}: ${msg.channel.guild.shard.latency}ms`,
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
