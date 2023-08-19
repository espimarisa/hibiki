import { sanitizedEnv } from "./env.js";

// A regex for file types that can be modules
export const moduleFiletypeRegex = /\.(cjs|mjs|js|mts|cts|ts)$/i;

// Hex colors used throughout the app
export enum HibikiColors {
  // Gold primary
  GENERAL = 0xff_b0_00,

  // Success pink
  SUCCESS = 0xdc_26_7f,

  // Orange error
  ERROR = 0xfe_61_00,
}

// Support invite
export const HibikiSupportInvite = "https://discord.gg/VpRscV3mdn";

// Invite permissions
export const HibikiInvitePermissions = 28_307_378_007_798;

// Invite scope
export const HibikiInviteScope = ["bot", "applications.commands"];

// Invite URI
export const HibikiInviteURI =
  "https://discord.com/oauth2/authorize?&client_id=" +
  `${sanitizedEnv.BOT_OAUTH_CLIENT_ID}&scope=${encodeURIComponent(HibikiInviteScope.join(" "))}&permissions=${HibikiInvitePermissions}`;
