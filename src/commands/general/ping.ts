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
  description = "Displays the current shard latency of the bot.";

  async run(msg: Message<TextChannel>, bot: hibikiClient): Promise<void> {
    console.log(await bot.db.getGuildConfig(msg.channel.guild.id));

    const pingmsg = (await bot.createEmbed("🏓 Ping", `Sending... (latency: ${msg.channel.guild.shard.latency}ms)`, msg)) as Message;

    pingmsg.edit({
      embed: {
        title: "🏓 Pong!",
        description: `This message took ${pingmsg.timestamp - msg.timestamp}ms to send.`,
        color: bot.convertHex("general"),
        footer: {
          text: `Ran by ${bot.tagUser(msg.author)} | Latency: ${msg.channel.guild.shard.latency}ms`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

export default new pingCommand();
