/**
 * @file Logger
 * @description Base class for loggers
 */

import type { GuildChannel } from "eris";
import { Guild, TextChannel } from "eris";
import { Event } from "./Event";

export abstract class Logger extends Event {
  // Gets the channel to try to send a log event to
  async getChannel(channel: Guild | TextChannel, type: string, event: string, cfg?: GuildConfig) {
    let guild: Guild;

    // Gets the type of logger and whether it's a guild or channel
    if (type !== "eventLogging" && type !== "memberLogging" && type !== "messageLogging" && type !== "pinChannel") type = "modLogging";
    if (channel?.constructor === Guild) guild = channel;
    else guild = (channel as GuildChannel)?.guild;
    if (!guild) return;

    const guildconfig = cfg || (await this.bot.db.getGuildConfig(guild.id));
    if (!guildconfig) return null;

    // Ignores channels set to be ignored
    if (channel instanceof TextChannel && guildconfig?.ignoredLoggingChannels?.includes?.((channel as unknown) as string)) {
      return null;
    }

    // Handles disabledEvents so users can opt-out of specific ones
    if (guildconfig.disabledEvents && guildconfig.disabledEvents.includes(event)) return null;
    let channelID = type ? guildconfig[type] : guildconfig.loggingChannel;

    // Stops trying to log to a channel if it stops existing
    if (channel instanceof Guild || channel.id !== channelID) {
      if (!guild.channels.get(channelID)) {
        delete guildconfig[type || "loggingChannel"];
        this.bot.db.updateGuildConfig(guild.id, guildconfig);
        channelID = undefined;
      }
    }

    return channelID;
  }
}
