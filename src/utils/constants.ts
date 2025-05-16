/**
 * @file Commonly-used strings, regexes, and variables.
 * @license zlib
 */

import { env } from "@/utils/env.ts";
import { join } from "node:path";

/**
 * Directories.
 */

// The directory that commands are stored in.
export const COMMANDS_DIRECTORY = join(import.meta.dirname, "../commands");

// The directory that event listeners are stored in.
export const LISTENERS_DIRECTORY = join(import.meta.dirname, "../listeners");

// The directory that locales are stored in.
export const LOCALES_DIRECTORY = join(import.meta.dirname, "../../locales");

// The directory that log files are stored in.
export const LOGS_DIRECTORY = join(import.meta.dirname, "../../logs");

// The root src directory.
export const SRC_DIRECTORY = join(import.meta.dirname, "..");

/**
 * Regexes.
 */

// A regex to validate valid ESM module file extensions.
export const MODULE_FILETYPE_REGEX = /\.(mjs|mts|ts|js)$/i;

/**
 * Strings and variables.
 */

// The current running version of the application.
export const HIBIKI_VERSION = env.npm_package_version ?? "develop";

// Bitfield of permissions to use in own invite URLs.
export const INVITE_PERMISSIONS = "563467534068800";

// A boolean indicating if the application is running in development mode.
export const IS_DEVELOPMENT = env.NODE_ENV === "DEVELOPMENT";

// Common Discord content length limits.
export enum DiscordLimits {
  Content = 2000,
  EmbedDescription = 4096,
  EmbedFieldName = 256,
  EmbedFieldValue = 1024,
  EmbedFooterText = 2048,
  EmbedTitle = 256,
}

// Commonly used embed colors.
export enum HibikiColors {
  Error = 0xff_30_00,
  Primary = 0xff_00_50,
  Secondary = 0xff_db_26,
  Starboard = 0xff_ac_33,
  Success = 0x00_ff_af,
}
