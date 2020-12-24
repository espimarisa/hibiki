/**
 * @file Message typings
 * @description Extensions for Eris.Message
 * @typedef message
 */

import { convertHex, createEmbed, editEmbed } from "../helpers/embed";
const userLocale = await bot.localeSystem.getUserLocale(msg.author.id, bot);
const string = bot.localeSystem.getLocaleFunction(userLocale) as LocaleString;

declare module "eris" {
  declare interface Message {
    createEmbed: typeof createEmbed;
    editEmbed: typeof editEmbed;
    convertHex: typeof convertHex;
    string: typeof string;
  }
}
