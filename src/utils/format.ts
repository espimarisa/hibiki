/**
 * @file Formatter
 * @description Formats and beautifies items
 * @module utils/format
 */

import type { User } from "eris";
import { auditLogRegex } from "../helpers/constants";
import type { LocaleString } from "../typings/locales";

// Tags a user by username#discriminator
export function tagUser(user: User, emojiFilter = false) {
  if (emojiFilter && user) {
    return `${auditLogRegex.exec(user.username) !== null ? auditLogRegex.exec(user.username)[0] : user.id}#${user.discriminator}`;
  } else if (user) {
    return `${user.username}#${user.discriminator}`;
  }
}

const logColors = {
  reset: "\x1b[0m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  white: "\x1b[37m",
  yellow: "\x1b[33m",
};

// Formats a timestamp to a human-readable one
export function dateFormat(timestamp: Date | number, colors = false) {
  const date = new Date(timestamp);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const time = `${(date.getHours() < 10 ? "0" : "") + date.getHours()}:${(date.getMinutes() < 10 ? "0" : "") + date.getMinutes()}`;
  return `${colors ? `${logColors.cyan}[` : ""}${month} ${day} ${year} ${time}${colors ? `]${logColors.reset}` : ""}`;
}

// Formats seconds to a HH:MM:SS timestamp
export function toHHMMSS(seconds: number) {
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds - hours * 3600) / 60);
  seconds = seconds - hours * 3600 - minutes * 60;
  if (hours < 10) hours = 0 + hours;
  if (minutes < 10) minutes = 0 + minutes;
  if (seconds < 10) seconds = 0 + seconds;

  const time = `${hours > 0 ? `${hours < 10 ? "0" : ""}${hours}:` : ""}${minutes < 10 ? "0" : ""}${minutes}:${
    seconds < 10 ? "0" : ""
  }${seconds}`;
  return time;
}

// Formats guild regions
export function regionFormat(region: string) {
  switch (region) {
    case "amsterdam":
      return "Amsterdam";
    case "brazil":
      return "Brazil";
    case "eu-central":
      return "Central Europe";
    case "eu-west":
      return "Western Europe";
    case "europe":
      return "Europe";
    case "dubai":
      return "Dubai";
    case "frankfurt":
      return "Frankfurt";
    case "hongkong":
      return "Hong Kong";
    case "london":
      return "London";
    case "japan":
      return "Japan";
    case "india":
      return "India";
    case "russia":
      return "Russia";
    case "singapore":
      return "Singapore";
    case "southafrica":
      return "South Africa";
    case "south-korea":
      return "South Korea";
    case "sydney":
      return "Sydney";
    case "us-central":
      return "US Central";
    case "us-east":
      return "US East";
    case "us-south":
      return "US South";
    case "us-west":
      return "US West";
    case undefined:
    default:
      return region;
  }
}

// Formats uptime
export function uptimeFormat(uptime: number) {
  const date = new Date(uptime * 1000);
  const days = date.getUTCDate() - 1;
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const segments = [];
  if (days > 0) segments.push(`${days} day${days === 1 ? "" : "s"}`);
  if (hours > 0) segments.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  if (minutes === 0) segments.push("less than a minute");
  if (minutes > 0) segments.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
  const dateString = segments.join(", ");
  return dateString;
}

// Localizes profile items in validItems
export function localizeProfileItems(string: LocaleString, item: string, title = false) {
  switch (item) {
    case "bio":
      if (title) return string("global.BIO");
      return string("general.PROFILE_BIO_DESCRIPTION");
    case "pronouns":
      if (title) return string("global.PRONOUNS");
      return string("general.PROFILE_PRONOUNS_DESCRIPTION");
    case "timezone":
      if (title) return string("global.TIMEZONE");
      return string("general.PROFILE_TIMEZONE_DESCRIPTION");
    case "timezoneHide":
      if (title) return string("global.TIMEZONEHIDE");
      return string("general.PROFILE_TIMEZONEHIDE_DESCRIPTION");
    case "delete":
      if (title) return string("global.DELETE");
      return string("general.PROFILE_DELETE_DESCRIPTION");
    case "locale":
      if (title) return string("global.LOCALE");
      return string("general.PROFILE_LOCALE_DESCRIPTION");
    case "gayLevel":
      if (title) return string("general.PROFILE_GAYLEVEL");
      return string("general.PROFILE_GAYLEVEL_DESCRIPTION");
    case undefined:
    default:
      return item;
  }
}

// Localizes setup items
export function localizeSetupItems(string: LocaleString, item: string, title = false, punishment = false) {
  switch (item) {
    case "agreeChannel":
      if (title) return string("general.CONFIG_AGREECHANNEL");
      return string("general.CONFIG_AGREECHANNEL_DESCRIPTION");
    case "agreeRole":
      if (title) return string("general.CONFIG_AGREEROLE");
      return string("general.CONFIG_AGREEROLE_DESCRIPTION");
    case "antiInvite":
      if (title) return string("general.CONFIG_ANTIINVITE");
      return string("general.CONFIG_ANTIINVITE_DESCRIPTION");
    case "antiSpam":
      if (title) return string("general.CONFIG_ANTISPAM");
      return string("general.CONFIG_ANTISPAM_DESCRIPTION");
    case "autoRoles":
      if (title) return string("general.CONFIG_AUTOROLES");
      return string("general.CONFIG_AUTOROLES_DESCRIPTION");
    case "easyTranslate":
      if (title) return string("general.CONFIG_EASYTRANSLATE");
      return string("general.CONFIG_EASYTRANSLATE_DESCRIPTION");
    case "eventLogging":
      if (title) return string("general.CONFIG_EVENTLOGGING");
      return string("general.CONFIG_EVENTLOGGING_DESCRIPTION");
    case "ignoredLoggingChannels":
      if (title) return string("general.CONFIG_IGNOREDLOGGINGCHANNELS");
      return string("general.CONFIG_IGNOREDLOGGINGCHANNELS_DESCRIPTION");
    case "invitePunishments":
      if (title) return string("general.CONFIG_INVITEPUNISHMENTS");
      if (punishment) return string("general.CONFIG_FORINVITES");
      return string("general.CONFIG_INVITEPUNISHMENTS_DESCRIPTION");
    case "joinMessage":
      if (title) return string("general.CONFIG_JOINMESSAGE");
      return string("general.CONFIG_JOINMESSAGE_DESCRIPTION");
    case "leaveMessage":
      if (title) return string("general.CONFIG_LEAVEMESSAGE");
      return string("general.CONFIG_LEAVEMESSAGE_DESCRIPTION");
    case "leaveJoin":
      if (title) return string("general.CONFIG_LEAVEJOIN");
      return string("general.CONFIG_LEAVEJOIN_DESCRIPTION");
    case "memberLogging":
      if (title) return string("general.CONFIG_MEMBERLOGGING");
      return string("general.CONFIG_MEMBERLOGGING_DESCRIPTION");
    case "messageLogging":
      if (title) return string("general.CONFIG_MESSAGELOGGING");
      return string("general.CONFIG_MESSAGELOGGING_DESCRIPTION");
    case "modLogging":
      if (title) return string("general.CONFIG_MODLOGGING");
      return string("general.CONFIG_MODLOGGING_DESCRIPTION");
    case "msgOnPunishment":
      if (title) return string("general.CONFIG_MSGONPUNISHMENT");
      return string("general.CONFIG_MSGONPUNISHMENT_DESCRIPTION");
    case "mutedRole":
      if (title) return string("general.CONFIG_MUTEDROLE");
      return string("general.CONFIG_MUTEDROLE_DESCRIPTION");
    case "pinAmount":
      if (title) return string("general.CONFIG_PINAMOUNT");
      return string("general.CONFIG_PINAMOUNT_DESCRIPTION");
    case "pinChannel":
      if (title) return string("general.CONFIG_PINCHANNEL");
      return string("general.CONFIG_PINCHANNEL_DESCRIPTION");
    case "pinEmoji":
      if (title) return string("general.CONFIG_PINEMOJI");
      return string("general.CONFIG_PINEMOJI_DESCRIPTION");
    case "pinSelfPinning":
      if (title) return string("general.CONFIG_PINSELFPINNING");
      return string("general.CONFIG_PINSELFPINNING_DESCRIPTION");
    case "snipingEnable":
      if (title) return string("general.CONFIG_SNIPINGENABLE");
      return string("general.CONFIG_SNIPINGENABLE_DESCRIPTION");
    case "snipingIgnore":
      if (title) return string("general.CONFIG_SNIPINGIGNORE");
      return string("general.CONFIG_SNIPINGIGNORE_DESCRIPTION");
    case "snipingInvites":
      if (title) return string("general.CONFIG_SNIPINGINVITES");
      return string("general.CONFIG_SNIPINGINVITES_DESCRIPTION");
    case "snipingPermission":
      if (title) return string("general.CONFIG_SNIPINGPERMISSION");
      return string("general.CONFIG_SNIPINGPERMISSION_DESCRIPTION");
    case "spamPunishments":
      if (title) return string("general.CONFIG_SPAMPUNISHMENTS");
      if (punishment) return string("general.CONFIG_FORSPAMMING");
      return string("general.CONFIG_SPAMPUNISHMENTS_DESCRIPTION");
    case "spamThreshold":
      if (title) return string("general.CONFIG_SPAMTHRESHOLD");
      return string("general.CONFIG_SPAMTHRESHOLD_DESCRIPTION");
    case "staffRole":
      if (title) return string("general.CONFIG_STAFFROLE");
      return string("general.CONFIG_STAFFROLE_DESCRIPTION");
    case "verifiedRole":
      if (title) return string("general.CONFIG_VERIFIEDROLE");
      return string("general.CONFIG_VERIFIEDROLE_DESCRIPTION");
    case "delete":
      return string("general.CONFIG_DELETE_DESCRIPTION");
    case "antiNewLines":
      if (title) return string("general.CONFIG_ANTINEWLINES");
      return string("general.CONFIG_ANTINEWLINES_DESCRIPTION");
    case "antiNewLinesPunishments":
      if (title) return string("general.CONFIG_ANTINEWLINESPUNISHMENTS");
      return string("general.CONFIG_ANTINEWLINESPUNISHMENT_DESCRIPTION");
    case "newlineThreshold":
      if (title) return string("general.CONFIG_NEWLINETHRESHOLD");
      return string("general.CONFIG_NEWLINETHRESHOLD_DESCRIPTION");
    case "raidPunishments":
      if (title) return string("general.CONFIG_ANTIRAIDPUNISHMENTS");
      return string("general.CONFIG_ANTIRAIDPUNISHMENTS_DESCRIPTION");
    case "antiRaid":
      if (title) return string("general.CONFIG_ANTIRAID");
      return string("general.CONFIG_ANTIRAID_DESCRIPTION");
    case "raidThreshold":
      if (title) return string("general.CONFIG_ANTIRAIDTHRESHOLD");
      return string("general.CONFIG_ANTIRAIDTHRESHOLD_DESCRIPTION");
    case "joinTitle":
      if (title) return string("general.CONFIG_JOINTITLE");
      return string("general.CONFIG_JOINTITLE_DESCRIPTION");
    case "leaveTitle":
      if (title) return string("general.CONFIG_LEAVETITLE");
      return string("general.CONFIG_LEAVETITLE_DESCRIPTION");
    case "greetingFooter":
      if (title) return string("general.CONFIG_GREETINGFOOTER");
      return string("general.CONFIG_GREETINGFOOTER_DESCRIPTION");
    case "disabledCmds":
      if (title) return string("general.CONFIG_DISABLEDCMDS");
      return string("general.CONFIG_DISABLEDCMDS_DESCRIPTION");
    case "prefix":
      if (title) return string("general.CONFIG_PREFIX");
      return string("general.CONFIG_PREFIX_DESCRIPTION");
    case "assignableRoles":
      if (title) return string("general.CONFIG_ASSIGNABLEROLES");
      return string("general.CONFIG_ASSIGNABLEROLES_DESCRIPTION");
    case "antiMassMention":
      if (title) return string("general.CONFIG_ANTIMASSMENTION");
      return string("general.CONFIG_ANTIMASSMENTION_DESCRIPTION");
    case "antiMassMentionPunishments":
      if (title) return string("general.CONFIG_ANTIMASSMENTIONPUNISHMENTS");
      return string("general.CONFIG_ANTIMASSMENTIONPUNISHMENTS_DESCRIPTION");
    case "massMentionThreshold":
      if (title) return string("general.CONFIG_ANTIMASSMENTIONTHRESHOLD");
      return string("general.CONFIG_ANTIMASSMENTIONTHRESHOLD_DESCRIPTION");
    case "locale":
      if (title) return string("general.CONFIG_DEFAULTLOCALE");
      return string("general.CONFIG_DEFAULTLOCALE_DESCRIPTION");
    case "disabledCategories":
      if (title) return string("general.CONFIG_DISABLEDCATEGORIES");
      return string("general.CONFIG_DISABLEDCATEGORIES_DESCRIPTION");
    case "musicRole":
      if (title) return string("general.CONFIG_MUSICROLE");
      return string("general.CONFIG_MUSICROLE_DESCRIPTION");
    case "musicChannel":
      if (title) return string("general.CONFIG_MUSICCHANNEL");
      return string("general.CONFIG_MUSICCHANNEL_DESCRIPTION");
    case "onlyRequesterCanControl":
      if (title) return string("general.CONFIG_ORCC");
      return string("general.CONFIG_ORCC_DESCRIPTION");
    case "logBotMessages":
      if (title) return string("general.CONFIG_LOGBOTMESSAGES");
      return string("general.CONFIG_LOGBOTMESSAGES_DESCRIPTION");
    case "agreeBlockCommands":
      if (title) return string("general.CONFIG_AGREEBLOCKCOMMANDS");
      return string("general.CONFIG_AGREEBLOCKCOMMANDS_DESCRIPTION");
    case undefined:
    default:
      return item;
  }
}

// Localizes askfor item types
export function localizeItemTypes(string: LocaleString, item: string) {
  switch (item) {
    case "channelID":
      return string("global.ASKFOR_CHANNEL");
    case "roleID":
      return string("global.ASKFOR_ROLE");
    case "voiceChannel":
      return string("global.ASKFOR_VOICECHANNEL");
    case "number":
      return string("global.ASKFOR_NUMBER");
    case "string":
      return string("global.ASKFOR_STRING");
    case "bool":
      return string("global.ASKFOR_BOOL");
    case "roleArray":
      return string("global.ASKFOR_ROLEARRAY");
    case "channelArray":
      return string("global.ASKFOR_CHANNELARRAY");
    case "emoji":
      return string("global.ASKFOR_EMOJI");
    case "timezone":
      return string("global.ASKFOR_TIMEZONE");
    case "array":
      return string("global.ASKFOR_ARRAY");
    case "bio":
      return string("global.ASKFOR_BIO");
  }
}

// Formats punishments
export function localizePunishments(string: LocaleString, item: string) {
  switch (item) {
    case "Mute":
      return string("moderation.MUTED");
    case "Purge":
      return string("moderation.PURGED");
    case "Warn":
      return string("moderation.WARNED");
    case "Ban":
      return string("moderation.BAN");
    case "Kick":
      return string("moderation.KICK");
  }
}

// Formats guild verification level
export function verificationLevelFormat(string: LocaleString, level: number) {
  switch (level) {
    case 0:
      return string("global.NONE");
    case 1:
      return string("global.LOW");
    case 2:
      return string("global.MEDIUM");
    case 3:
      return string("global.HIGH");
    case 4:
      return string("global.HIGHEST");
    case undefined:
    default:
      return level;
  }
}

// Formats MFA/2FA level
export function mfaLevelFormat(string: LocaleString, level: number) {
  switch (level) {
    case 0:
      return string("logger.DISABLED");
    case 1:
      return string("logger.ENABLED");
    default:
      return string("global.UNKNOWN");
  }
}

// Formats notification settings
export function notificationLevelFormat(string: LocaleString, level: number) {
  switch (level) {
    case 0:
      return string("general.SERVER_NOTIFICATIONLEVEL_0");
    case 1:
      return string("general.SERVER_NOTIFICATIONLEVEL_1");
    case undefined:
    default:
      return level;
  }
}

// Formats explicit content filter
export function contentFilterFormat(string: LocaleString, level: number) {
  switch (level) {
    case 0:
      return string("global.OFF");
    case 1:
      return string("general.SERVER_CONTENTLEVEL_1");
    case 2:
      return string("general.SERVER_CONTENTLEVEL_2");
    case undefined:
    default:
      return level;
  }
}

// Formats AFK channel timeouts
export function afkTimeoutFormat(string: LocaleString, level: number) {
  switch (level) {
    case 60:
      return string("global.MINUTES", { minutes: "1" });
    case 300:
      return string("global.MINUTES", { minutes: "5" });
    case 900:
      return string("global.MINUTES", { minutes: "15" });
    case 1800:
      return string("global.MINUTES", { minutes: "30" });
    case 3600:
      return string("global.HOURS", { hours: "1" });
    case undefined:
    default:
      return level;
  }
}

// Converts time to 24 hours
export function to24Hours(string: LocaleString, time: number) {
  let hours: number;
  let minutes: number;
  const seconds = Math.floor(time / 1000);
  minutes = Math.floor(seconds / 60);
  hours = Math.floor(minutes / 60);
  minutes %= 60;
  const day = Math.floor(hours / 24);
  hours %= 24;
  hours += day * 24;
  return string("global.FORMAT_DAY", {
    hours: hours,
    minutes: minutes,
  });
}

// Localizes guild features
export function featureFormat(string: LocaleString, features: string[]) {
  if (!features) return undefined;
  return features.map((feature) => {
    switch (feature) {
      case "COMMUNITY":
        return string("general.SERVER_FEATURE_COMMUNITY");
      case "WELCOME_SCREEN_ENABLED":
        return string("general.SERVER_FEATURE_WELCOME");
      case "INVITE_SPLASH":
        return string("general.SERVER_FEATURE_SPLASH");
      case "VANITY_URL":
        return string("general.SERVER_FEATURE_VANITY");
      case "ANIMATED_ICON":
        return string("general.SERVER_FEATURE_ANIMATED");
      case "PARTNERED":
        return string("general.SERVER_FEATURE_PARTNERED");
      case "VERIFIED":
        return string("general.SERVER_FEATURE_VERIFIED");
      case "VIP_REGIONS":
        return string("general.SERVER_FEATURE_VIPREGIONS");
      case "PUBLIC":
        return string("general.SERVER_FEATURE_PUBLIC");
      case "LURKABLE":
        return string("general.SERVER_FEATURE_LURKABLE");
      case "COMMERCE":
        return string("general.SERVER_FEATURE_COMMERCE");
      case "NEWS":
        return string("general.SERVER_FEATURE_NEWS");
      case "DISCOVERABLE":
        return string("general.SERVER_FEATURE_DISCOVERABLE");
      case "FEATURABLE":
        return string("general.SERVER_FEATURE_FEATURABLE");
      case "BANNER":
        return string("general.SERVER_FEATURE_BANNER");
      case "PREVIEW_ENABLED":
        return string("general.SERVER_FEATURE_PREVIEW");
      case "MEMBER_VERIFICATION_GATE_ENABLED":
        return string("general.SERVER_FEATURE_GATE");
      case undefined:
      default:
        return features;
    }
  });
}
