/**
 * @file Argtype typings
 * @description Typings for the argument parser
 * @typedef argtypes
 */

import type { AnyChannel, Guild, Member, Message, Role, TextChannel, User, VoiceChannel } from "eris";
import type { HibikiClient } from "../classes/Client";

interface ArgTypes {
  boolean: {
    (a: string, msg: Message, flag?: ["strict"]): boolean;
  };

  channel: {
    (a: string, msg: Message<TextChannel>, flag?: ("fallback" | "allowVoice")[]): AnyChannel | undefined;
  };

  channelArray: {
    (a: string[], msg: Message<TextChannel>): string[] | "No channels";
  };

  guild: {
    (a: string, msg: Message<TextChannel>, flag?: string[], b: HibikiClient): Guild;
  };

  member: {
    (a: string, msg: Message<TextChannel>, flag?: ("fallback" | "userFallback" | "strict")[]): Member | Promise<User> | User | undefined;
  };

  number: {
    (a: number, msg: Message<TextChannel>, flag?: ["negative"]): number;
  };

  role: {
    (a: string, msg: Message<TextChannel>, flag?: string[]): Role | undefined;
  };

  roleArray: {
    (a: string[], msg: Message<TextChannel>): string[] | undefined;
  };

  string: {
    (a: string): string;
  };

  user: {
    (a: string, msg?: Message<TextChannel>, flag?: ["REST"]): Promise<User> | User | undefined;
  };

  voiceChannel: {
    (a: string, msg: Message<TextChannel>, flag?: string[]): VoiceChannel | undefined;
  };
}
