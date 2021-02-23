/**
 * @file Main typings
 * @description Typings and extensions for the bot
 * @typedef index
 */

// Parsed arguments
interface ParsedArgs {
  flag: string | string[] | undefined;
  name: string;
  optional: boolean;
  type: string;
  value?: any;
}

// Fixed Eris messageReactions typing
interface MessageReactions {
  [s: string]: unknown;
  count: number;
  me: boolean;
}

// Bot log data
interface BotLogs {
  args: string[];
  authorID: string;
  cmdName: string;
  date: number;
  guildID: string;
}

// Antispam data
interface AntiSpam {
  content: string;
  date: number;
  guild: string;
  id: string;
  msgid: string;
}

// Item in validItems.ts
interface ValidItem {
  category?: string;
  default?: boolean | string | number;
  emoji?: string;
  id?: string;
  inviteFilter?: boolean;
  label?: string;
  maximum?: number;
  minimum?: number;
  name?: string;
  type?: string;
}

// Valid item category
interface ValidItemsCategory {
  emoji: string;
  id?: string;
  items: string[];
  name: string;
}

// Bulmaselect options
interface Bulmaselect {
  children?: Record<string, string>[];
  label?: string;
  type?: string;
}
