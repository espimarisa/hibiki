import { sanitizedEnv } from "./env.js";

// Are we actually in production or not?
export const IS_PRODUCTION = sanitizedEnv.isProduction;

// A regex for file types that can be modules
export const moduleFiletypeRegex = /\.(cjs|mjs|js|mts|cts|ts)$/i;

// The version of Hibiki currently running
export const hibikiVersion = sanitizedEnv.npm_package_version ?? "develop";

// Hex colors used throughout the app
export enum HibikiColors {
  // Gold primary
  GENERAL = 0xff_b0_00,

  // Success pink
  SUCCESS = 0xdc_26_7f,

  // Orange error
  ERROR = 0xfe_61_00,
}
