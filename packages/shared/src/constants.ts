import { sanitizedEnv } from "./env.js";

// A regex for file types that can be modules
export const moduleFiletypeRegex = /\.(cjs|mjs|js|mts|cts|ts)$/i;

// Hex colors used throughout the app
export const HibikiColors = {
  // Gold primary
  GENERAL: 0xff_b0_00,

  // Success pink
  SUCCESS: 0xdc_26_7f,

  // Orange error
  ERROR: 0xfe_61_00,
};

// Donate URL
export const HibikiDonateURL = "https://github.com/sponsors/espimarisa";

// Translate URL
// TODO: Add a URL
export const HibikiTranslateURL = "https://github.com/espimarisa/hibiki";

// License URL
export const HibikiLicenseURL = "https://github.com/espimarisa/hibiki/blob/develop/LICENSE.md";

// Support invite
export const HibikiSupportInvite = "https://discord.gg/VpRscV3mdn";

// Invite permissions
export const HibikiInvitePermissions = 28_307_378_007_798;

// Invite scope
export const HibikiInviteScope = ["bot", "applications.commands"];

// Invite URI
export const HibikiInviteURI =
  "https://discord.com/oauth2/authorize?&client_id=" +
  `${sanitizedEnv.BOT_CLIENT_ID}&scope=${encodeURIComponent(HibikiInviteScope.join(" "))}&permissions=${HibikiInvitePermissions}`;
