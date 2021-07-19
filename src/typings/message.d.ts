/**
 * @file Message typings
 * @description Typings and extensions for Eris.Message
 * @typedef message
 */

import type { LocaleString } from "./locales";
import type { tagUser } from "../utils/format";
import type { convertHex, createEmbed, editEmbed } from "../utils/embed";

declare module "eris" {
  declare interface Message {
    convertHex: typeof convertHex;
    createEmbed: typeof createEmbed;
    editEmbed: typeof editEmbed;
    prefix?: string;
    locale?: LocaleString;
    tagUser: typeof tagUser;
  }
}
