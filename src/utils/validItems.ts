/**
 * @file Valid items
 * @description Valid guildconfig and userconfig items
 * @module utils/validItems
 */

import { defaultLocale } from "../../config.json";

export const validItems = [
  /**
   * Feature options
   */
  {
    category: "features",
    emoji: "☑",
    id: "agreeChannel",
    type: "channel",
    dependencies: ["agreeBlockCommands"],
  },
  {
    category: "features",
    id: "agreeBlockCommands",
    emoji: "⛔",
    type: "boolean",
    default: true,
  },
  {
    category: "features",
    id: "easyTranslate",
    emoji: "🌍",
    type: "boolean",
    default: false,
  },
  {
    category: "features",
    id: "guildLocale",
    emoji: "🌐",
    type: "locale",
    default: defaultLocale,
  },
  {
    id: "assignableRoles",
    category: "roles",
    type: "roleArray",
    emoji: "📝",
  },
  {
    id: "disabledCategories",
    category: "features",
    type: "array",
    emoji: "🛑",
  },
  {
    id: "disabledCmds",
    category: "features",
    type: "array",
    emoji: "🚫",
  },
  {
    id: "prefix",
    category: "features",
    type: "string",
    emoji: "🤖",
    minimum: 1,
    maximum: 15,
  },

  /**
   * Greeting options
   */

  {
    category: "greeting",
    emoji: "👋",
    id: "leaveJoin",
    type: "channel",
    dependencies: ["greetingFooter", "leaveTitle", "joinTitle", "leaveMessage", "joinMessage"],
  },
  {
    category: "greeting",
    emoji: "✉",
    id: "joinMessage",
    type: "string",
    minimum: 1,
    maximum: 256,
  },
  {
    category: "greeting",
    emoji: "🚪",
    id: "leaveMessage",
    type: "string",
    minimum: 1,
    maximum: 256,
  },
  {
    category: "greeting",
    emoji: "📄",
    id: "joinTitle",
    type: "string",
    minimum: 1,
    maximum: 100,
  },
  {
    category: "greeting",
    emoji: "📃",
    id: "leaveTitle",
    type: "string",
    minimum: 1,
    maximum: 100,
  },
  {
    category: "greeting",
    emoji: "📝",
    id: "greetingFooter",
    type: "string",
    minimum: 1,
    maximum: 64,
  },

  /**
   * Logging options
   */

  {
    category: "logging",
    emoji: "📄",
    id: "eventLogging",
    type: "channel",
  },
  {
    category: "logging",
    emoji: "📜",
    id: "messageLogging",
    type: "channel",
    dependencies: ["logBotMessages"],
  },
  {
    category: "logging",
    emoji: "📰",
    id: "memberLogging",
    type: "channel",
  },
  {
    category: "logging",
    emoji: "📃",
    id: "modLogging",
    type: "channel",
  },
  {
    category: "logging",
    emoji: "📵",
    id: "ignoredLoggingChannels",
    type: "channelArray",
  },
  {
    category: "logging",
    emoji: "🤖",
    id: "logBotMessages",
    type: "boolean",
    default: false,
  },
  {
    category: "logging",
    emoji: "🔗",
    id: "inviteOptOut",
    type: "boolean",
    default: false,
  },

  /**
   * Music options
   */

  {
    category: "music",
    id: "musicRole",
    type: "role",
    emoji: "🎧",
  },
  {
    category: "music",
    id: "musicChannel",
    type: "voiceChannel",
    emoji: "🎶",
  },
  {
    category: "music",
    id: "onlyRequesterCanControl",
    type: "boolean",
    emoji: "🎛",
  },

  /**
   * Pinboard options
   */

  {
    category: "pinboard",
    emoji: "📍",
    id: "pinChannel",
    type: "channel",
    dependencies: ["pinAmount", "pinEmoji", "pinSelfPinning"],
  },
  {
    category: "pinboard",
    emoji: "🔢",
    id: "pinAmount",
    minimum: 1,
    type: "number",
    default: 5,
  },
  {
    category: "pinboard",
    emoji: "⭐",
    id: "pinEmoji",
    type: "emoji",
    default: "📌",
    maximum: 2,
  },
  {
    category: "pinboard",
    emoji: "🗣",
    id: "pinSelfPinning",
    type: "boolean",
    default: true,
  },

  /**
   * Role options
   */

  {
    category: "roles",
    emoji: "✔",
    id: "agreeRole",
    type: "role",
  },
  {
    category: "roles",
    emoji: "☑",
    id: "verifiedRole",
    type: "role",
  },
  {
    category: "roles",
    emoji: "🔨",
    id: "staffRole",
    type: "role",
  },
  {
    category: "roles",
    emoji: "👤",
    id: "autoRoles",
    type: "roleArray",
    maximum: 5,
  },
  {
    category: "roles",
    emoji: "🔕",
    id: "mutedRole",
    type: "role",
  },

  /**
   * Sniping options
   */

  {
    category: "sniping",
    emoji: "💣",
    id: "snipingEnable",
    type: "boolean",
    default: true,
    dependencies: ["snipingIgnore", "snipingInvites", "snipingPermission"],
  },
  {
    category: "sniping",
    emoji: "🚫",
    id: "snipingIgnore",
    type: "channelArray",
  },
  {
    category: "sniping",
    emoji: "🔗",
    id: "snipingInvites",
    type: "boolean",
    default: true,
  },
  {
    category: "sniping",
    emoji: "⛔",
    id: "snipingPermission",
    type: "boolean",
    default: false,
  },

  /**
   * Automod options
   */

  {
    category: "automod",
    emoji: "🔗",
    id: "antiInvite",
    type: "boolean",
    default: false,
    dependencies: ["invitePunishments", "msgOnPunishment"],
  },
  {
    category: "automod",
    emoji: "🏓",
    id: "antiMassMention",
    type: "boolean",
    default: false,
    dependencies: ["antiMassMentionPunishments", "massMentionThreshold"],
  },
  {
    category: "automod",
    emoji: "😶",
    id: "antiNewLines",
    type: "boolean",
    default: false,
    dependencies: ["antiNewLinesPunishments", "newlineThreshold"],
  },
  {
    category: "automod",
    emoji: "🔥",
    id: "antiRaid",
    type: "boolean",
    default: false,
    dependencies: ["raidPunishments", "raidThreshold"],
  },
  {
    category: "automod",
    emoji: "🚯",
    id: "antiSpam",
    type: "boolean",
    default: false,
    dependencies: ["spamPunishments", "spamThreshold"],
  },
  {
    category: "automod",
    emoji: "🔨",
    id: "antiNewLinesPunishments",
    type: "punishment",
    default: ["Purge"],
  },
  {
    category: "automod",
    emoji: "⚒",
    id: "invitePunishments",
    type: "punishment",
    default: ["Purge"],
  },
  {
    category: "automod",
    emoji: "🧨",
    id: "antiMassMentionPunishments",
    type: "punishment",
    default: ["Purge"],
  },
  {
    category: "automod",
    emoji: "‼",
    id: "raidPunishments",
    type: "raidPunishment",
  },
  {
    category: "automod",
    emoji: "🛠",
    id: "spamPunishments",
    type: "punishment",
    default: ["Purge"],
  },
  {
    category: "automod",
    emoji: "💬",
    id: "msgOnPunishment",
    type: "boolean",
    default: true,
  },
  {
    category: "automod",
    emoji: "#️⃣",
    id: "newlineThreshold",
    type: "number",
    minimum: 15,
    default: 30,
  },
  {
    category: "automod",
    emoji: "⁉",
    id: "raidThreshold",
    type: "number",
    minimum: 15,
    maximum: 30,
    default: 20,
  },
  {
    category: "automod",
    emoji: "🔢",
    id: "spamThreshold",
    minimum: 5,
    maximum: 10,
    default: 7,
    type: "number",
  },
  {
    category: "automod",
    emoji: "*️⃣",
    id: "massMentionThreshold",
    minimum: 6,
    maximum: 20,
    default: 8,
    type: "number",
  },

  /**
   * Profile options
   */

  {
    emoji: "🏷️",
    category: "profile",
    id: "bio",
    type: "string",
    minimum: 1,
    maximum: 200,
    inviteFilter: true,
  },
  {
    emoji: "💖",
    category: "profile",
    id: "pronouns",
    type: "pronouns",
  },
  {
    emoji: "🌐",
    category: "profile",
    id: "locale",
    type: "locale",
    default: defaultLocale,
  },
  {
    emoji: "🕒",
    category: "profile",
    id: "timezone",
    type: "timezone",
  },
  {
    emoji: "🚫",
    category: "profile",
    id: "timezoneHide",
    type: "boolean",
    default: false,
  },
  {
    emoji: "🏳️‍🌈",
    category: "profile",
    id: "gayLevel",
    type: "number",
    minimum: 0,
    maximum: 100,
  },
] as ValidItem[];
