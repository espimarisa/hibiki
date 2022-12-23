/**
 * @file Constants
 * @description Globally used string and regexes
 * @module constants
 */

// A regex for file types that can be ESM modules
export const moduleFiletypeRegex = /\.(cjs|mjs|js|mts|cts|ts)$/i;

// A regex for valid slash command names
export const slashCommandNameRegex = /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;

// The version of Hibiki currently running
export const hibikiVersion = process.env.npm_package_version ?? "development";
