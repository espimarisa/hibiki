/**
 * @file Utility containing commonly-used strings and variables.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { GatewayIntentBits, InteractionContextType } from "discord.js";

/** Commonly used colors. */
export enum HibikiColors {
  Primary = 0xff0050,
  Secondary = 0xffdb26,
  Success = 0x00ffaf,
  Error = 0xff3000,
}

/** Shorthand array for all interaction context types. */
export const AllInteractionContextTypes = [
  InteractionContextType.Guild,
  InteractionContextType.BotDM,
  InteractionContextType.PrivateChannel,
];

/** Shorthand array for all required intents. */
export const HibikiIntents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.MessageContent,
];

/** Bitfield of permissions used for generating bot invites. */
export const INVITE_PERMISSIONS = "563467534068800";

/** Zero-width space unicode modifier used to create empty embed fields. */
export const ZWSP = "\u200b";

/** Regex validating Discord tokens. */
export const DISCORD_TOKEN_REGEX = /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/;

/** Regex validating Discord snowflakes. */
export const DISCORD_SNOWFLAKE_REGEX = /^(?<id>\d{17,20})$/;
