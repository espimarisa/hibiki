/**
 * @file Constants
 * @description Regexes and other constants used throughout the app
 * @module helpers/constants
 */

export const userIDRegex = /\d{17,18}/g;
export const auditLogRegex = /[,.\-_a-zA-Z0-9]{1,32}/;

// Validate emojis
export const defaultEmojiRegex = /\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]/;
export const animatedEmojiRegex = /<a:[^\s]+:\d{17,18}>/;
export const emojiIDRegex = /:[^\s]+:\d{17,18}>/;
export const emojiNameRegex = /(?<=:)[^\s]+(?=:)/;

// Invite regexes
export const inviteRegex = /https(:)\/\/discord.(gg)\/[a-zA-Z0-9]+/;

/**
 * Fucking motherfucking /g in our regex caused us at least an hour of fucking confusion and JavaScript fuckery.
 * JavaScript is a terrible language and everyone should be using Rust at this point.
 * Additionally, fuck .test() and the dipshit "engineer" that came up with the JavaScript "programming language".
 * Why in the everliving fuck it does some of the stuff it does I will never understand and I don't think even the
 * creator understands what ungodly creation he has brought upon our Earth.
 *
 * TOTAL TIME WASTED ON THIS STUPID SHIT: 1 HOUR AND 17 MINUTES BETWEEN THE DATES OF 1/2/2021 AND 1/3/2021
 *
 * God bless StackOverflow: https://stackoverflow.com/questions/2630418/javascript-regex-returning-true-then-false-then-true-etc
 * - Espi
 */

export const fullInviteRegex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|com)|discordapp\.com\/invite)\/.+\w/;

// Strings and URLs
export const defaultAvatar = "https://cdn.discordapp.com/embed/avatars/0.png";
