/**
 * @file Constants
 * @description Regexes and other constants used throughout the app
 * @module helpers/constants
 */

export const userIDRegex = /\d{17,18}/g;

// Validate emojis
export const animatedEmojiRegex = /<a:[^\s]+:\d{17,18}>/;
export const emojiIDRegex = /:[^\s]+:\d{17,18}>/;
export const emojiNameRegex = /(?<=:)[^\s]+(?=:)/;

// Invite regexes
export const inviteRegex = /https(:)\/\/discord.(gg)\/[a-zA-Z0-9]+/g;
export const fullInviteRegex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|com)|discordapp\.com\/invite)\/.+[a-z]/g;

// Strings and URLs
export const defaultAvatar = "https://cdn.discordapp.com/embed/avatars/0.png";
