/**
 * @file Main typings
 * @description Typings and extensions for the bot
 * @typedef index
 */

interface ParsedArgs {
  (commandArgs: string, args: string, msg: Message): string;
}

interface LocaleString {
  (string: string, args?: Record<string, unknown> | undefined): string;
}

interface MessageReactions {
  [s: string]: unknown;
  count: number;
  me: boolean;
}
