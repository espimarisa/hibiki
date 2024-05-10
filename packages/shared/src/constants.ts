// A regex for validating Discord bot tokens
export const DISCORD_BOT_TOKEN_REGEX = /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/;

// A regex for file types that can be modules
export const MODULE_FILE_TYPE_REGEX = /\.(cjs|mjs|js|mts|cts|ts)$/i;

export const HibikiColors = {
  // Gold #FFB000
  GENERAL: 0xff_b0_00,

  // Success #DC267F
  SUCCESS: 0xdc_26_7f,

  // Orange #FE6100
  ERROR: 0xfe_61_00,
};

// Donate URL
export const HibikiDonateURL = "https://github.com/sponsors/espimarisa";

// Translate URL
// TODO: Add a URL
export const HibikiTranslateURL = "https://github.com/espimarisa/hibiki";

// License URL
export const HibikiLicenseURL = "https://github.com/espimarisa/hibiki/LICENSE.md";

// Support invite
export const HibikiSupportInvite = "https://discord.gg/VpRscV3mdn";

// Invite permissions
export const HibikiInvitePermissions = 28_307_378_007_798;

// Invite scope
export const HibikiInviteScope = ["bot", "applications.commands"];

// Homepage URL
export const HibikiWebURL = "https://hibiki.app";

export const HibikiPrivacyURL = "https://github.com/espimarisa/hibiki#data-privacy";
export const HibikiTermsURL = "https://github.com/espimarisa/hibiki#terms-of-service";
