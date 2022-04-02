/**
 * @file Database types
 * @description Typings for Database items
 * @typedef database
 */

// Valid database providers
type HibikiDatabaseProvider = "json" | "rethinkdb" | "mongodb";

/**
 * Hibiki guild config options
 */

interface HibikiGuildConfig {
  // Fixes some TypeScript bullshittery
  [k: string]: string;

  // The guild's ID
  id: DiscordSnowflake;

  // Configured default locale for all new users to use
  locale?: HibikiLocaleCode;
}

/**
 * Hibiki user config options
 */

interface HibikiUserConfig {
  // Fixes some TypeScript bullshittery
  [k: string]: string;

  // The user's ID
  id: DiscordSnowflake;

  // Configured locale for the user; overrides guild & default one
  locale?: HibikiLocaleCode;
}

type HibikiUserConfigs = HibikiUserConfig[];

/**
 * Hibiki blacklist
 */
interface HibikiBlacklistItem {
  id: DiscordSnowflake;
  reason?: string;
  type: "GUILD" | "USER";
}

type HibikiGuildOrUser = "GUILD" | "USER";
