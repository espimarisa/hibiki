import { Message, TextChannel } from "eris";
import { Command, CommandCategories, LocaleString } from "../../classes/Command";
import { HibikiClient } from "../../classes/Client";

class PingCommand extends Command {
  name = "ping";
  category = CommandCategories.GENERAL;
  aliases = ["pong"];
  description = "Returns the bot's latency.";

  async run(msg: Message<TextChannel>, string: LocaleString, bot: HibikiClient) {
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

export default new PingCommand();
