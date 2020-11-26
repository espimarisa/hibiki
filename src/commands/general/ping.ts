/**
 * @fileoverview Hibiki ping command
 * @description Displays the currentt shard latency and heartbeat of the bot.
 * @author Espi <contact@espi.me>
 */

import { Message, TextChannel } from "eris";
import { Command, CommandCategories } from "../../structures/Command";
import { hibikiClient } from "../../structures/Client";

class pingCommand extends Command {
  // TODO: Inherit this from the filename, instead of doing it as abstract and needing to do it here.
  name = "ping";
  category = CommandCategories.FUN;
  // TODO: Inherit category from the subfolder. Have an enum or something to format them from "fun" to "Fun", etc.
  aliases = ["pong"];
  description = "Displays the current shard latency and heartbeat of the bot.";

  async run(msg: Message<TextChannel>, bot: hibikiClient): Promise<void> {
    const pingmsg = await bot.createEmbed("🏓 Ping", `Sending... (latency: ${msg.channel.guild.shard.latency}ms)`, msg);

    pingmsg.edit({
      embed: {
        title: "🏓 Pong!",
        description: `This message took ${pingmsg.timestamp - msg.timestamp}ms to send.`,
        color: bot.embedColor("general"),
        footer: {
          // TODO: bot.tagUser(msg.author);
          text: `Ran by ${msg.author.username}#${msg.author.discriminator} | Latency: ${msg.channel.guild.shard.latency}ms`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

export default new pingCommand();
