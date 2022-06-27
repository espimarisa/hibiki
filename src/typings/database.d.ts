/**
 * @file Database
 * @description Typings for items in Hibiki's database
 * @typedef database
 */

interface HibikiGuildConfig {
  guild_id?: DiscordSnowflake;
  locale?: HibikiLocaleCode;
}

interface HibikiUserConfig {
  user_id?: DiscordSnowflake;
  locale?: HibikiLocaleCode;
}
