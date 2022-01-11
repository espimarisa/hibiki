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

/**
 * Hibiki user config options
 */

interface HibikiUserConfig {
  // The user's ID
  id: DiscordSnowflake;

  // Configured locale for the user; overrides guild & default one
  locale?: HibikiLocaleCode;
}
