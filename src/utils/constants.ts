// A regex for validating Discord bot tokens
export const DISCORD_BOT_TOKEN_REGEX = /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/;

// A regex for file types that can be modules
export const MODULE_FILE_TYPE_REGEX = /\.(cjs|mjs|js|mts|cts|ts)$/i;

export const HibikiColors = {
  // Gold #FFB000
  GENERAL: 0xffb000,

  // Success #DC267F
  SUCCESS: 0xdc267f,

  // Orange #FE6100
  ERROR: 0xfe6100,
};

// Donate URL
export const HibikiDonateURL = "https://github.com/sponsors/espimarisa";
