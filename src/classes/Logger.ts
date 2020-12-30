/**
 * @file Logger
 * @description Base class for loggers
 */

import { Guild, TextChannel } from "eris";
import { Event } from "./Event";

export abstract class Logger extends Event {
  async getChannel(channel: TextChannel | Guild, type: string, event: string) {
    if (type !== "eventLogging" && type !== "memberLogging" && type !== "messageLogging") type = "modLogging";
    let guild;
    if (channel.constructor === Guild) guild = channel;
    // @ts-expect-error
    else guild = channel.guild;

    const guildconfig = await this.bot.db.getGuildConfig(guild.id);
    if (!guildconfig) return null;

    // Ignores channels set to be ignored
    if (channel.constructor === TextChannel && guildconfig.ignoredLoggingChannels && guildconfig.ignoredLoggingChannels.includes(channel))
      return null;
    if (guildconfig.disabledEvents && guildconfig.disabledEvents.includes(event)) return null;

    let channelID = type ? guildconfig[type] : guildconfig.loggingChannel;

    if (channel.constructor === Guild || channel.id !== channelID) {
      if (!guild.channels.get(channelID)) {
        delete guildconfig[type || "loggingChannel"];
        this.bot.db.db.table("guildconfig").update(guildconfig);
        channelID = undefined;
      }
    }

    return channelID;
  }
}
