/**
 * @file Main typings
 * @description Typings and extensions for the bot
 * @typedef index
 */

interface LocaleString {
  (string: string, args?: Record<string, unknown> | undefined): string;
}

interface ParsedArgs {
  name: string;
  type: string;
  flag: string | undefined;
  optional: boolean;
  value?: any;
}

interface MessageReactions {
  [s: string]: unknown;
  count: number;
  me: boolean;
}

interface BotLogs {
  cmdName: string;
  authorID: string;
  guildID: string;
  args: string[];
  date: number;
}

interface AntiSpam {
  date: number;
  id: string;
  guild: string;
  content: string;
  msgid: string;
}

interface ValidItem {
  category?: string;
  name?: string;
  label?: string;
  type?: string;
  emoji?: string;
  id?: string;
  minimum?: number;
  maximum?: number;
  inviteFilter?: boolean;
  default?: boolean | string | number;
}

interface ValidItemsCategory {
  name: string;
  emoji: string;
  items: string[];
  id?: string;
}

interface Bulmaselect {
  label?: string;
  type?: string;
  children?: Record<string, string>[];
}

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
