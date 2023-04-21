/**
 * @file index.d.ts
 * @description Global Hibiki typings
 */

// "Private" import loophole for global types
type PrivateEventListeners = import("@projectdysnomia/dysnomia").EventListeners;

// An individual event listener
type HibikiEventListener = keyof PrivateEventListeners;

// Stricter DiscordSnowflake type
type DiscordSnowflake = `${string}`;
