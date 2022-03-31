/**
 * @file Database types
 * @description Typings for Database items
 * @typedef database
 */

// Valid database providers
type HibikiDatabaseProvider = "json";

/**
 * Hibiki guild config options
 */

interface HibikiGuildConfig {
  // The guild's ID
  id: DiscordSnowflake;

  // Configured default locale for all new users to use
  locale?: HibikiLocaleCode;
}

type HibikiGuildConfigs = HibikiGuildConfig[];

/**
 * Hibiki user config options
 */

interface HibikiUserConfig {
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

type HibikiBlacklist = HibikiBlacklistItem[];

type HibikiGuildOrUser = "GUILD" | "USER";
