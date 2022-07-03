/**
 * @file Database
 * @description Typings for items in Hibiki's database
 * @typedef database
 */

// A valid Hibiki Guild Config
interface HibikiGuildConfig {
  // The Guild ID associated with the entry
  guild_id?: DiscordSnowflake;

  // If set, this overrides the application's default locale
  locale?: HibikiLocaleCode;
}

// A valid Hibiki User Config
interface HibikiUserConfig {
  // The User ID associated with the DB entry
  user_id?: DiscordSnowflake;

  // If set, this overrides the application's default locale
  locale?: HibikiLocaleCode;
}
