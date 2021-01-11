/**
 * @file Formatter
 * @description Formats and beautifies items
 * @module utils/format
 */

import type { User } from "eris";
import { auditLogRegex } from "../helpers/constants";

/** Tags a user by username#discriminator */
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

/** Formats a timestamp to a human-readable one */
export function dateFormat(timestamp: Date | number, colors = false) {
  const date = new Date(timestamp);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const time = `${(date.getHours() < 10 ? "0" : "") + date.getHours()}:${(date.getMinutes() < 10 ? "0" : "") + date.getMinutes()}`;
  return `${colors ? `${logColors.cyan}[` : ""}${month} ${day} ${year} ${time}${colors ? `]${logColors.reset}` : ""}`;
}

/** Formats seconds to a HH:MM:SS timestamp */
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

/** Formats guild regions */
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
    default:
      return region;
  }
}

/** Formats uptime */
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
    case undefined:
    default:
      return item;
  }
}

/** Formats guild verification level */
export function verificationLevelFormat(level: number) {
  switch (level) {
    case 0:
      return "None";
    case 1:
      return "Low";
    case 2:
      return "Medium";
    case 3:
      return "High";
    case 4:
      return "Highest";
    default:
      return "Unknown";
  }
}

/** Formats MFA/2FA level */
export function mfaLevelFormat(level: number) {
  switch (level) {
    case 0:
      return "Disabled";
    case 1:
      return "Enabled";
    default:
      return "Unknown";
  }
}

/** Formats notification settings */
export function notificationLevelFormat(level: number) {
  switch (level) {
    case 0:
      return "All Messages";
    case 1:
      return "Only @mentions";
    default:
      return "Unknown";
  }
}

/** Formats explicit content filter */
export function contentFilterFormat(level: number) {
  switch (level) {
    case 0:
      return "Off";
    case 1:
      return "Only Roleless Members";
    case 2:
      return "All Members";
    default:
      return "Unknown";
  }
}

/** Formats AFK channel timeouts */
export function afkTimeoutFormat(level: number) {
  switch (level) {
    case 60:
      return "1 minute";
    case 300:
      return "5 minutes";
    case 900:
      return "15 minutes";
    case 1800:
      return "30 minutes";
    case 3600:
      return "1 hour";
    default:
      return "No timeout";
  }
}
