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
    formattedDuration.set("years", t("YEARS", { count: time.years, lng: locale, ns: "time" }));
  }

  // Number of Months
  if (time.months && !disabledItems?.months) {
    formattedDuration.set("months", t("MONTHS", { count: time.months, lng: locale, ns: "time" }));
  }

  // Number of weeks
  if (time.weeks && !disabledItems?.weeks) {
    formattedDuration.set("weeks", t("WEEKS", { count: time.weeks, lng: locale, ns: "time" }));
  }

  // Number of days
  if (time.days && !disabledItems?.days) {
    formattedDuration.set("days", t("DAYS", { count: time.days, lng: locale, ns: "time" }));
  }

  // Number of minutes
  if (time.minutes && !disabledItems?.minutes) {
    formattedDuration.set("minutes", t("MINUTES", { count: time.minutes, lng: locale, ns: "time" }));
  }

  // Number of seconds
  if (time.seconds && !disabledItems?.seconds) {
    formattedDuration.set("seconds", t("SECONDS", { count: time.seconds, lng: locale, ns: "time" }));
  }

  return [...formattedDuration.values()].join(", ");
}

// Localizes channel types
export function localizeChannelType(type: ChannelType, locale: string) {
  switch (type) {
    // Announcement channel
    case ChannelType.GuildAnnouncement:
      return t("ANNOUNCEMENT", { lng: locale, ns: "global" });

    // Category
    case ChannelType.GuildCategory:
      return t("CATEGORY", { lng: locale, ns: "global" });

    // Guild forum
    case ChannelType.GuildForum:
      return t("FORUM", { lng: locale, ns: "global" });

    // Guild directory
    case ChannelType.GuildDirectory:
      return t("DIRECTORY", { lng: locale, ns: "global" });

    // Guild media
    case ChannelType.GuildMedia:
      return t("MEDIA", { lng: locale, ns: "global" });

    // Stage channel
    case ChannelType.GuildStageVoice:
      return t("STAGE", { lng: locale, ns: "global" });

    // Text channel
    case ChannelType.GuildText:
      return t("TEXT", { lng: locale, ns: "global" });

    // Voice channel
    case ChannelType.GuildVoice:
      return t("VOICE", { lng: locale, ns: "global" });

    // Private thread
    case ChannelType.PrivateThread:
      return t("PRIVATE_THREAD", { lng: locale, ns: "global" });

    // Thread
    case ChannelType.PublicThread:
      return t("THREAD", { lng: locale, ns: "global" });

    // Returns the raw type (future-proofing)
    default:
      return type.toString();
  }
}
