/**
 * @file Database types
 * @description Typings for Database items
 * @typedef database
 */

// Valid database providers
type HibikiDatabaseProvider = "json";

// A Hibiki guild config
interface HibikiGuildConfig {
  id: DiscordSnowflake;
  locale?: HibikiLocaleCode;
}

// A Hibiki user config
interface HibikiUserConfig {
  id: DiscordSnowflake;
  locale?: HibikiLocaleCode;
}
