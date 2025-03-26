/**
 * @file constants
 * @description Global variables used throughout Hibiki.
 * @author Espi Marisa <contact@espi.me>
 */

// A regex for validating Discord bot tokens
export const DISCORD_TOKEN_REGEX = /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/;

// A regex for file types that can be modules
export const MODULE_FILETYPE_REGEX = /\.(cjs|mjs|js|mts|cts|ts)$/i;

// Hex colors used for embeds
export const HibikiColors = {
	GENERAL: 0xffb000,
	SUCCESS: 0xdc267f,
	ERROR: 0xfe6100,
};
