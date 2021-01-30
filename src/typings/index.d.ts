/**
 * @file Main typings
 * @description Typings and extensions for the bot
 * @typedef index
 */

// LocalString function
interface LocaleString {
  (string: string, args?: Record<string, unknown> | undefined): string;
}

// Parsed arguments
interface ParsedArgs {
  flag: string | undefined;
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

// Argument types
interface ArgTypes {
  boolean: {
    (a: string, msg: Message, flag?: string): boolean;
  };

  channel: {
    (a: string, msg: Message<TextChannel>, flag?: string): AnyChannel | undefined;
  };

  channelArray: {
    (a: string[], msg: Message<TextChannel>): string[] | "No channels";
  };

  guild: {
    (a: string, msg: Message<TextChannel>, flag?: string, b: HibikiClient): Guild;
  };

  member: {
    (a: string, msg: Message<TextChannel>, flag?: string): Member | undefined;
  };

  number: {
    (a: number, msg: Message<TextChannel>, flag?: string): number;
  };

  role: {
    (a: string, msg: Message<TextChannel>, flag?: string): Role | undefined;
  };

  roleArray: {
    (a: string[], msg: Message<TextChannel>): string[] | undefined;
  };

  string: {
    (a: string): string;
  };

  user: {
    (a: string): User | undefined;
  };

  voiceChannel: {
    (a: string, msg: Message<TextChannel>, flag?: string): VoiceChannel | undefined;
  };
}
