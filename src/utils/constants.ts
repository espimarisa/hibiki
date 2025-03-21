/**
 * @file constants
 * @description Global variables and strings used throughout the app
 * @author Espi Marisa <contact@espi.me>
 */

// A regex for validating Discord bot tokens
export const REGEX_DISCORD_TOKEN = /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/;

// A regex for file types that can be modules
export const REGEX_MODULE_FILETYPE = /\.(cjs|mjs|js|mts|cts|ts)$/i;

// Hex colors used for embeds
export const HibikiColors = {
	GENERAL: 0xffb000,
	SUCCESS: 0xdc267f,
	ERROR: 0xfe6100,
};
