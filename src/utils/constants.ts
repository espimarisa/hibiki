/**
 * @file Common variables and helpers used throughout the application.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/constants
 */

// A regex for validating Discord bot tokens
export const DISCORD_TOKEN_REGEX = /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/;

// A regex for file types that can be modules
export const MODULE_FILETYPE_REGEX = /\.(cjs|mjs|js|mts|cts|ts)$/i;

// Hex colors used for embeds
export const HibikiColors = {
	error: 0xfe6100,
	general: 0xffb000,
	success: 0xdc267f,
};
