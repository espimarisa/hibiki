/**
 * @file Config
 * @description Typings for a valid Hibiki config file
 * @typedef config
 */

type PrivateClientOptions = import("discord.js").ClientOptions;
type PrivateColorResolvable = import("discord.js").ColorResolvable & `#${string}`;

interface HibikiConfig {
  // A Discord bot token to login with
  token: string;

  // The default locale to use
  defaultLocale: HibikiLocaleCode;

  // A guild ID to push commands to when running in development mode
  testGuildID?: DiscordSnowflake;

  // An object of Discord.js Client options
  clientOptions?: PrivateClientOptions | Record<string, unknown>;

  // An object of valid hex colours
  colours: HibikiColourOptions;
}

// Valid config.colours options
type HibikiColourOptions = {
  // Indexing type
  [key: string]: PrivateColorResolvable;

  // Primary hex colour
  primary: PrivateColorResolvable;

  // Secondary hex colour
  secondary: PrivateColorResolvable;

  // Error hex colour
  error: PrivateColorResolvable;

  // Success hex colour
  success: PrivateColorResolvable;

  // Warning hex colour
  warning: PrivateColorResolvable;
};
