/**
 * @file Index
 * @description General global typings
 * @typedef index
 */

// Privately imports types to not break global typings
type PrivateClientEvents = import("discord.js").ClientEvents;

// Hibiki event emitters
type HibikiEventEmitter = keyof PrivateClientEvents;

// Global Discord snowflake type
type DiscordSnowflake = import("discord.js").Snowflake;

// Valid locale codes. This list will need to be updated manually.
type HibikiLocaleCode = "en-GB";
