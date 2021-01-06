/**
 * @file Valid items
 * @description Valid guildconfig and userconfig items
 * @module utils/validItems
 */

export const validItems = [
  /**
   * Feature options
   */

  {
    category: "features",
    emoji: "☑",
    id: "agreeChannel",
    type: "channelID",
  },
  {
    category: "features",
    id: "easyTranslate",
    emoji: "🌍",
    type: "bool",
  },

  /**
   * Greeting options
   */

  {
    category: "greeting",
    emoji: "👋",
    id: "leaveJoin",
    type: "channelID",
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
    type: "channelID",
  },
  {
    category: "logging",
    emoji: "📜",
    id: "messageLogging",
    type: "channelID",
  },
  {
    category: "logging",
    emoji: "📰",
    id: "memberLogging",
    type: "channelID",
  },
  {
    category: "logging",
    emoji: "📃",
    id: "modLogging",
    type: "channelID",
  },
  {
    category: "logging",
    emoji: "📵",
    id: "ignoredLoggingChannels",
    type: "channelArray",
  },

  /**
   * Music options
   * TODO: Add these
   */

  /**
   * Pinboard options
   */
  {
    category: "pinboard",
    emoji: "📍",
    id: "pinChannel",
    type: "channelID",
  },
  {
    category: "pinboard",
    emoji: "🔢",
    id: "pinAmount",
    type: "number",
  },
  {
    category: "pinboard",
    emoji: "⭐",
    id: "pinEmoji",
    type: "emoji",
  },
  {
    category: "pinboard",
    emoji: "🗣",
    id: "pinSelfPinning",
    type: "bool",
  },

  /**
   * Role options
   */

  {
    category: "roles",
    emoji: "✔",
    id: "agreeRole",
    type: "roleID",
  },
  {
    category: "roles",
    emoji: "☑",
    id: "verifiedRole",
    type: "roleID",
  },
  {
    category: "roles",
    emoji: "🔨",
    id: "staffRole",
    type: "roleID",
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
    type: "roleID",
  },

  /**
   * Sniping options
   */

  {
    category: "sniping",
    emoji: "💣",
    id: "snipingEnable",
    type: "bool",
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
    type: "bool",
  },
  {
    category: "sniping",
    emoji: "⛔",
    id: "snipingPermission",
    type: "bool",
  },

  /**
   * Automod options
   */

  {
    category: "automod",
    emoji: "🔗",
    id: "antiInvite",
    type: "bool",
  },
  {
    category: "automod",
    emoji: "😶",
    id: "antiNewLines",
    type: "bool",
  },
  {
    category: "automod",
    emoji: "🔥",
    id: "antiRaid",
    type: "bool",
  },
  {
    category: "automod",
    emoji: "🚯",
    id: "antiSpam",
    type: "bool",
  },
  {
    category: "automod",
    emoji: "🔨",
    id: "antiNewLinesPunishments",
    type: "punishment",
  },
  {
    category: "automod",
    emoji: "⚒",
    id: "invitePunishments",
    type: "punishment",
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
  },
  {
    category: "automod",
    emoji: "💬",
    id: "msgOnPunishment",
    type: "bool",
  },
  {
    category: "automod",
    emoji: "#️⃣",
    id: "newlineThreshold",
    type: "number",
    minimum: 10,
  },
  {
    category: "automod",
    emoji: "⁉",
    id: "raidThreshold",
    type: "number",
    minimum: 15,
  },
  {
    category: "automod",
    emoji: "🔢",
    id: "spamThreshold",
    minimum: 5,
    maximum: 10,
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
    emoji: "🕒",
    category: "profile",
    id: "timezone",
    type: "timezone",
  },
  {
    emoji: "🚫",
    category: "profile",
    id: "timezoneHide",
    type: "bool",
  },

  /**
   * Other items not in config.ts
   */

  {
    id: "assignableRoles",
    type: "roleArray",
  },
  {
    id: "disabledCategories",
    type: "array",
  },
  {
    id: "disabledCmds",
    type: "array",
  },
  {
    id: "prefix",
    type: "string",
    minimum: 1,
    maximum: 15,
  },
];
