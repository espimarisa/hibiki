/**
 * @file Formatter
 * @description Formats and beautifies items
 * @module helpers/format
 */

import type { User } from "eris";

/** Tags a user by username#discriminator */
export function tagUser(user: User) {
  return `${user.username}#${user.discriminator}`;
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
