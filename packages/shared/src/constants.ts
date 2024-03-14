// A regex for validating Discord bot tokens
export const DISCORD_BOT_TOKEN_REGEX = /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/;

// A regex for file types that can be modules
export const MODULE_FILE_TYPE_REGEX = /\.(cjs|mjs|js|mts|cts|ts)$/i;

export const HibikiColors = {
  // Gold primary #FFB000
  GENERAL: 0xff_b0_00,

  // Success pink #DC267F
  SUCCESS: 0xdc_26_7f,

  // Orange error #FE6100
  ERROR: 0xfe_61_00,
};
