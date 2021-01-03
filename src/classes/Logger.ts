/**
 * @file Logger
 * @description Base class for loggers
 */

import { Guild, TextChannel } from "eris";
import { Event } from "./Event";

export abstract class Logger extends Event {
  // Gets the channel to try to send a log event to
  async getChannel(channel: Guild | TextChannel, type: string, event: string) {
    let guild;

    // Gets the type of logger and whether it's a guild or channel
    if (type !== "eventLogging" && type !== "memberLogging" && type !== "messageLogging") type = "modLogging";
    if (channel?.constructor === Guild) guild = channel;
    // Who gives a shit about type safety?
    // @ts-expect-error
    else guild = channel?.guild;
    if (!guild) return;

    const guildconfig = await this.bot.db.getGuildConfig(guild.id);
    if (!guildconfig) return null;

    // Ignores channels set to be ignored
    if (channel.constructor === TextChannel && guildconfig.ignoredLoggingChannels && guildconfig.ignoredLoggingChannels.includes(channel)) {
      return null;
    }

    // Handles disabledEvents so users can opt-out of specific ones
    if (guildconfig.disabledEvents && guildconfig.disabledEvents.includes(event)) return null;
    let channelID = type ? guildconfig[type] : guildconfig.loggingChannel;

    // Stops trying to log to a channel if it stops existing
    if (channel.constructor === Guild || channel.id !== channelID) {
      if (!guild.channels.get(channelID)) {
        delete guildconfig[type || "loggingChannel"];
        this.bot.db.updateGuildConfig(guildconfig);
        channelID = undefined;
      }
    }

    return channelID;
  }
}
