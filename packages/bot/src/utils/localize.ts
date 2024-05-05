import { t } from "$shared/i18n.ts";
import type { Duration } from "date-fns";
import { ChannelType } from "discord.js";

type LocalizedDuration = {
  years?: string;
  months?: string;
  weeks?: string;
  days?: string;
  hours?: string;
  minutes?: string;
  seconds?: string;
};

// Returns a formatted string (ex. 2 months, 1 day, 3 minutes, 60 seconds)
export function localizeTimeSince(time: Duration, locale: string, disabledItems?: LocalizedDuration) {
  const formattedDuration: Map<keyof LocalizedDuration, string> = new Map();

  // Number of years
  if (time.years && !disabledItems?.years) {
    formattedDuration.set("years", t("time:YEARS", { count: time.years, lng: locale }));
  }

  // Number of Months
  if (time.months && !disabledItems?.months) {
    formattedDuration.set("months", t("time:MONTHS", { count: time.months, lng: locale }));
  }

  // Number of weeks
  if (time.weeks && !disabledItems?.weeks) {
    formattedDuration.set("weeks", t("time:WEEKS", { count: time.weeks, lng: locale }));
  }

  // Number of days
  if (time.days && !disabledItems?.days) {
    formattedDuration.set("days", t("time:DAYS", { count: time.days, lng: locale }));
  }

  // Number of minutes
  if (time.minutes && !disabledItems?.minutes) {
    formattedDuration.set("minutes", t("time:MINUTES", { count: time.minutes, lng: locale }));
  }

  // Number of seconds
  if (time.seconds && !disabledItems?.seconds) {
    formattedDuration.set("seconds", t("time:SECONDS", { count: time.seconds, lng: locale }));
  }

  return [...formattedDuration.values()].join(", ");
}

// Localizes channel types
export function localizeChannelType(type: ChannelType, locale: string) {
  switch (type) {
    // Announcement channel
    case ChannelType.GuildAnnouncement:
      return t("global:ANNOUNCEMENT", { lng: locale });

    // Category
    case ChannelType.GuildCategory:
      return t("global:CATEGORY", { lng: locale });

    // Guild forum
    case ChannelType.GuildForum:
      return t("global:FORUM", { lng: locale });

    // Guild directory
    case ChannelType.GuildDirectory:
      return t("global:DIRECTORY", { lng: locale });

    // Guild media
    case ChannelType.GuildMedia:
      return t("global:MEDIA", { lng: locale });

    // Stage channel
    case ChannelType.GuildStageVoice:
      return t("global:STAGE", { lng: locale });

    // Text channel
    case ChannelType.GuildText:
      return t("global:TEXT", { lng: locale });

    // Voice channel
    case ChannelType.GuildVoice:
      return t("global:VOICE", { lng: locale });

    // Private thread
    case ChannelType.PrivateThread:
      return t("global:PRIVATE_THREAD", { lng: locale });

    // Thread
    case ChannelType.PublicThread:
      return t("global:THREAD", { lng: locale });

    // Returns the raw type (future-proofing)
    default:
      return type.toString();
  }
}
