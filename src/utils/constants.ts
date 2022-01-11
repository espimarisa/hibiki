/**
 * @file Constants
 * @description Strings and regexes used throughout the app
 * @module constants
 */

// Module files (only .js or .ts)
export const moduleFiletypeRegex = /\.(js|ts)$/i;

// A regex for valid HTTP(s) addresses
export const httpRegex = /https?:\/\/(?:www\.)?([\w#%+.:=@~-]{1,256})\.[\d()A-Za-z]{1,6}\b([\w#%&()+./:=?@~-]*)/;

// A regex for valid Java Web Tokens
export const jwtRegex = /^[\w=-]+\.[\w=-]+\.?[\w+./=-]*$/;

// A regex for valid colour codes
export const colourRegex = /^(#|0x)([\dA-Fa-f]{6}|[\dA-Fa-f]{3})$/;

// A regex for valid octal colour codes
export const octalColourRegex = /^0x([\dA-Fa-f]{6}|[\dA-Fa-f]{3})$/;
