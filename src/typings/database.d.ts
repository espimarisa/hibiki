/**
 * @file Database Typings
 * @description Typings and valid items for the RethinkDB database
 * @typedef database
 */

// Interface for guildConfigs
interface GuildConfig {
  id?: string;
  agreeChannel?: string;
  agreeRole?: string;
  antiInvite?: boolean;
  antiSpam?: boolean;
  assignableRoles?: string[];
  autoRoles?: string[];
  disabledCategories?: string[];
  disabledCmds?: string[];
  easyTranslate?: boolean;
  invitePunishments?: string[];
  leaveJoin?: string;
  joinMessage?: string;
  leaveMessage?: string;
  eventLogging?: string;
  messageLogging?: string;
  memberLogging?: string;
  modLogging?: string;
  ignoredLoggingChannels?: any[];
  msgOnPunishment?: boolean;
  mutedRole?: string;
  snipingEnable?: boolean;
  snipingIgnore?: string[];
  snipingInvites?: boolean;
  snipingPermission?: boolean;
  staffRole?: string;
  pinAmount?: number;
  pinChannel?: string;
  pinEmoji?: string;
  pinSelfPinning?: boolean;
  prefix?: string;
  spamPunishments?: string[];
  spamThreshold?: number;
  verifiedRole?: string;
  loggingChannel?: string;
  disabledEvents?: string[];
  antiNewLinesPunishments?: string[];
  antiNewLines?: boolean;
  newlineThreshold?: number;
  raidPunishments?: string;
  antiRaid?: boolean;
  raidThreshold?: number;
  joinTitle?: string;
  leaveTitle?: string;
  greetingFooter?: string;
}

// Interface for userConfigs
interface UserConfig {
  id?: string;
  bio?: string;
  pronouns?: string;
  timezone?: string;
  timezoneHide?: boolean;
  locale?: string;
}

// Interface for MuteCache
interface MuteCache {
  role?: string;
  member?: string;
  guild?: string;
}

// Interface for UserWarning
interface UserWarning {
  id?: string;
  reason?: string;
  giver?: string;
  receiver?: string;
  guild?: string;
}
