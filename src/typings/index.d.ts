/**
 * @file Index
 * @description Global Hibiki typings used throughout the app
 * @typedef index
 */

// Privately imports dependencies
type PrivateIntentsString = import("discord.js").IntentsString;
type PrivateClientEvents = import("discord.js").ClientEvents;
type PrivateSnowflake = import("discord.js").Snowflake;

// Hibiki event emitters
type HibikiEventEmitter = keyof PrivateClientEvents;

// A Discord Snowflake ID
type DiscordSnowflake = PrivateSnowflake;

// A resolvable string of intents
type ResolvableIntentString = import("discord.js").BitFieldResolvable<PrivateIntentsString, number>;

// Valid locale codes. This list will need to be updated manually.
type HibikiLocaleCode = "en-GB";
