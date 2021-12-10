/**
 * @file Config
 * @description Typings for config.json
 * @typedef config
 */

type PrivateClientOptions = import("discord.js").ClientOptions;
type PrivateColorResolvable = import("discord.js").ColorResolvable & `0x${string}`;

// Options for Hibiki itself
type HibikiBaseOptions = {
  token: string;
  locale: HibikiLocaleCode;
  testGuildID: string;
};

// Valid hex colours
type HibikiColourOptions = {
  primary: PrivateColorResolvable;
  secondary: PrivateColorResolvable;
  error: PrivateColorResolvable;
  success: PrivateColorResolvable;
  warning: PrivateColorResolvable;
};

// A valid Hibiki database config
interface HibikiDatabaseOptions {
  provider: HibikiDatabaseProvider;
}

// A valid config.json
interface HibikiConfig {
  database: HibikiDatabaseOptions;
  hibiki: HibikiBaseOptions;
  options: PrivateClientOptions;
  colours: HibikiColourOptions;
}
