/**
 * @file Constants
 * @description Regexes and other constants used throughout the app
 * @module helpers/constants
 */

export const userIDRegex = /\d{17,18}/;
export const auditLogRegex = /[,.\-_a-zA-Z0-9]{1,32}/;
export const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
export const validTimeRegex = /\d{1,2}( )?(?:(y(?= )|y(ear(s)?)?)|(w(?= )|w(eek(s)?)?)|(d(?= )|d(ay(s)?)?)|(h(?= )|h(our(s)?)?(r(s)?)?)|(m(?= )|m(inute(s)?)?(in(s)?)?)|(s(?= )|s(econd(s)?)?(ec(s)?)?))( and( )?)?([, ]{1,2})?/gi;

// Validate emojis
export const defaultEmojiRegex = /\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]/;
export const animatedEmojiRegex = /<a:[^\s]+:\d{17,18}>/;
export const emojiIDRegex = /<:[^\s]+:\d{17,18}>/;
export const emojiNameRegex = /(?<=:)[^\s]+(?=:)/;

// Invite regexes
export const inviteRegex = /(https?:\/\/)?discord.(gg)\/[a-z0-9]+/i;
export const fullInviteRegex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|com)|discordapp\.com\/invite)\/.+\w/i;

// Strings and URLs
export const defaultAvatar = "https://cdn.discordapp.com/embed/avatars/0.png";
