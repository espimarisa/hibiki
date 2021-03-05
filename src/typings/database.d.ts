/**
 * @file Database Typings
 * @description Typings and valid items for the RethinkDB database
 * @typedef database
 */

// Guildconfig data
interface GuildConfig {
  agreeBlockCommands?: boolean;
  agreeChannel?: string;
  agreeRole?: string;
  antiInvite?: boolean;
  antiMassMention?: boolean;
  antiMassMentionPunishments?: string[];
  antiNewLines?: boolean;
  antiNewLinesPunishments?: string[];
  antiRaid?: boolean;
  antiSpam?: boolean;
  assignableRoles?: string[];
  autoRoles?: string[];
  customCommands?: Record<string, string>[];
  disabledCategories?: string[];
  disabledCmds?: string[];
  disabledEvents?: string[];
  easyTranslate?: boolean;
  eventLogging?: string;
  filteredWords?: string[];
  greetingFooter?: string;
  id?: string;
  ignoredLoggingChannels?: string[];
  inviteOptOut?: boolean;
  invitePunishments?: string[];
  joinMessage?: string;
  joinTitle?: string;
  leaveJoin?: string;
  leaveMessage?: string;
  leaveTitle?: string;
  guildLocale?: string;
  logBotMessages?: boolean;
  loggingChannel?: string;
  massMentionThreshold?: number;
  memberLogging?: string;
  messageLogging?: string;
  modLogging?: string;
  msgOnPunishment?: boolean;
  musicChannel?: string;
  musicRole?: string;
  mutedRole?: string;
  newlineThreshold?: number;
  onlyRequesterCanControl?: boolean;
  pinAmount?: number;
  pinChannel?: string;
  pinEmoji?: string;
  pinSelfPinning?: boolean;
  prefix?: string;
  raidPunishments?: string;
  raidThreshold?: number;
  snipingEnable?: boolean;
  snipingIgnore?: string[];
  snipingInvites?: boolean;
  snipingPermission?: boolean;
  spamPunishments?: string[];
  spamThreshold?: number;
  staffRole?: string;
  verifiedRole?: string;
}

// Userconfig data
interface UserConfig {
  bio?: string;
  gayLevel?: number;
  id?: string;
  locale?: string;
  pronouns?: string | number;
  timezone?: string;
  timezoneHide?: boolean;
}

// Mutecache data
interface MuteCache {
  expiration?: number;
  guild?: string;
  member?: string;
  role?: string;
  roles?: string[];
}

// User warning data
interface UserWarning {
  giver: string;
  guild: string;
  id: string;
  reason: string;
  receiver: string;
}

// User point data
interface UserPoint {
  giver: string;
  guild: string;
  id: string;
  reason: string;
  receiver: string;
}

// Economy data
interface UserCookies {
  amount?: number;
  id?: string;
  lastclaim?: Date;
}

// Blacklist data
interface BlacklistInfo {
  guild?: boolean;
  id?: string;
  reason?: string;
  user?: boolean;
}

// Reminder data
interface Reminder {
  date?: number;
  id?: string;
  message?: string;
  set?: Date;
  user?: string;
}

// Marriage data
interface UserMarriage {
  id?: string;
  spouse?: string;
}

// Steammonitor data
interface SteamMonitor {
  date?: number;
  id: string;
  user?: string;
  username?: string;
}

// Snipe data
interface SnipeData {
  [id: string]: {
    id?: string;
    content?: string;
    author?: string;
    authorpfp?: string;
    msg?: string;
    attachment?: string;
    timestamp?: Date;
  };
}
