/**
 * @file Config
 * @description Typings for config.json
 * @typedef config
 */

type PrivateClientOptions = import("discord.js").ClientOptions;
type PrivateColorResolvable = import("discord.js").ColorResolvable & `0x${string}`;
type PrivateApplicationCommandData = import("discord.js").ApplicationCommandData;

/**
 * Hibiki's core options
 */

type HibikiBaseOptions = {
  // A Discord bot token to login with
  token: string;

  // A valid default Hibiki locale code to utilize
  locale: HibikiLocaleCode;

  // A guild ID to deploy test commands in
  testGuildID: string;

  // An optional array of prefixes for legacy text-only commands to utilise
  prefixes?: string[];
};

/**
 * Hibiki hex colour config
 */

type HibikiColourOptions = {
  // eat shit batman
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

/**
 * Hibiki database config
 */

interface HibikiDatabaseOptions {
  // The database to connect to (for RethinkDB)
  db?: string;

  // The host IP to connect the database to
  host?: string;

  // The port the database is listening on
  port?: RangeOf<1, 65_535>;

  // The user to try to connect to
  user?: string;

  // The password to attempt to use
  password?: string;

  url?: string;

  // The database provider to use
  provider: HibikiDatabaseProvider;
}

/**
 * Hibiki webserver config
 */

interface HibikiWebserverConfig {
  // The base URL that the index page is located on
  baseURL: string;

  // The bot's client ID to use for Oauth2
  clientID: DiscordSnowflake;

  // The bot's client secret to use for Oauth2
  clientSecret: string;

  // A secret (32 characters at minimum) for cookies / sessions
  sessionSecret: string;

  // The callback URI to listen on for Oauth2 responses
  callbackURI: string;

  // The port to listen on
  port: RangeOf<1, 65_535>;
}

/**
 * A validated Hibiki config
 */

interface HibikiConfig {
  // Database options
  database: HibikiDatabaseOptions;

  // Core Hibiki options
  hibiki: HibikiBaseOptions;

  // Discord.js client options
  options?: PrivateClientOptions | Record<string, never>;

  // Colour options
  colours: HibikiColourOptions;

  // Webserver config options
  webserver: HibikiWebserverConfig;
}

/**
 * Hibiki command data in JSON form for slash command registration
 */

interface HibikiCommandJSON {
  // The command name, inherited from the filename
  name: string;

  // The command description
  description: string;

  // Slash command options
  options?: ApplicationCommandData[];
}
