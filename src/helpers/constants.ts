/**
 * @fileoverview Constants used throughout Hibiki
 * @description Regexes and other stuff
 * @author Espi <contact@espi.me>
 * @module helpers/constants
 */

// Validate IDs
export const idRegex = /\d{17,18}/g;

// Validate emojis
export const emojiRegex = /:[^\s]+:\d{17,18}>/;
export const animatedEmojiRegex = /<a:[^\s]+:\d{17,18}>/;

// Invite regexes
export const inviteRegex = /https(:)\/\/discord.(gg|com)\/[a-zA-Z0-9]+/g;
export const fullInviteRegex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|com)|discordapp\.com\/invite)\/.+[a-z]/g;
