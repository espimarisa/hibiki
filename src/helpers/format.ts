/**
 * @file Formatter
 * @description Formats and beautifies items
 * @module helpers/format
 */

import { User } from "eris";

/**
 * Tags a user.
 * @param {User} user The user object to tag
 *
 * @example tagUser(msg.author);
 */

export function tagUser(user: User): string {
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

/**
 * Formats a date for console logging
 * @param {Date} timestamp The timestamp to format
 */

export function formatLogDate(timestamp: Date): string {
  const date = new Date(timestamp);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const time = `${(date.getHours() < 10 ? "0" : "") + date.getHours()}:${(date.getMinutes() < 10 ? "0" : "") + date.getMinutes()}`;
  return `${logColors.cyan}[${month} ${day} ${year} ${time}]${logColors.reset}`;
}
