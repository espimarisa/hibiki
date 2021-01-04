/**
 * @file Message typings
 * @description Extensions for Eris.Message
 * @typedef message
 */

import type { tagUser } from "utils/format";
import type { convertHex, createEmbed, editEmbed } from "../helpers/embed";

declare module "eris" {
  declare interface Message {
    createEmbed: typeof createEmbed;
    editEmbed: typeof editEmbed;
    convertHex: typeof convertHex;
    string: typeof string;
    tagUser: typeof tagUser;
  }
}
