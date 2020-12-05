/**
 * @file Ping command
 * @author Espi <contact@espi.me>
 * @command
 */

import { Message, TextChannel } from "eris";
import { Command, CommandCategories } from "../../structures/Command";
import { hibikiClient } from "../../structures/Client";

class pingCommand extends Command {
  name = "ping";
  category = CommandCategories.GENERAL;
  aliases = ["pong"];
  description = "Returns the bot's latency.";

  async run(msg: Message<TextChannel>, string: any, bot: hibikiClient): Promise<void> {
    const pingmsg = await msg.channel.createMessage({
      embed: {
        title: string("general.PING_INITIAL_TITLE"),
        description: string("general.PING_INITIAL_DESCRIPTION", { latency: msg.channel.guild.shard.latency }),
        color: bot.convertHex("general"),
        footer: {
          text: string("global.RAN_BY_FOOTER", { author: bot.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });

    pingmsg.edit({
      embed: {
        title: string("general.PING_FINAL_TITLE"),
        description: string("general.PING_FINAL_DESCRIPTION", { latency: pingmsg.timestamp - msg.timestamp }),
        color: bot.convertHex("general"),
        footer: {
          text: string("general.PING_FINAL_FOOTER", { author: bot.tagUser(msg.author), latency: msg.channel.guild.shard.latency }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

export default new pingCommand();
