/**
 * @file Locale system
 * @description Functions for locale and string parsing
 */

import { readdir, readFile } from "fs";
import { HibikiClient } from "./Client";
import config from "../../config.json";

export class LocaleSystem {
  locales: Record<string, string>;

  /** Creates a new locale system */
  constructor(path: string) {
    this.locales = {};
    if (path) this.updateLocales(path);
  }

  updateLocales(path: string) {
    // Reads the locales directory
    readdir(path, { withFileTypes: true }, (err, files) => {
      if (err) throw err;

      // Loads each locale
      files.forEach((file) => {
        // todo: endsWith() to make sure we don't load any junk
        if (file.isDirectory()) this.updateLocales(`${path}/${file.name}`);
        else if (file.isFile()) {
          readFile(`${path}/${file.name}`, { encoding: "utf8" }, (_err, fileData) => {
            if (err) throw err;
            this.locales[file.name.replace(/.json/, "")] = JSON.parse(fileData);
          });
        }
      });
    });
  }

  /** Returns a string from a specific locale */
  getLocale(language: string, fieldName: string, args: { [x: string]: any } | undefined) {
    // Gets the string category
    const category = fieldName.split(".");
    let output = "";

    output = this._findLocaleString(language, fieldName, category);
    if (!output) output = this._findLocaleString(config.defaultLocale ? config.defaultLocale : "en", fieldName, category);

    // Sends an error if the string doesn't exist
    if (!output) throw new Error(`${fieldName} is missing in the string table for ${language}`);

    // Passes arguments to the string
    if (args) {
      Object.getOwnPropertyNames(args).forEach((arg) => {
        // Handles plurals/non-plural and arguments
        const argumentRegex = new RegExp(`{${arg}:#([\\w ]{1,})#!([\\w ]{1,})!}`);
        const plurals = argumentRegex.exec(output);
        // Sends the output with the correct grammar
        if (plurals) output = output.replace(plurals[0], `${args[arg]}${args[arg] === 1 ? plurals[2] : plurals[1]}`);
        else if (!plurals) output = output.replace(`{${arg}}`, args[arg]);
      });
    }

    return output;
  }

  /** Runs the function to return a locale string */
  getLocaleFunction(language: string) {
    return (fieldName: string, args?: Record<string, unknown>) => this.getLocale(language, fieldName, args);
  }

  /** Returns what locale a user uses */
  async getUserLocale(user: string, bot: HibikiClient) {
    let locale = "";
    const userConfig = await bot.db.getUserConfig(user);
    if (userConfig?.locale) locale = userConfig.locale;
    else if (!userConfig?.locale) locale = "en";

    return locale;
  }

  private _findLocaleString(language: string, fieldName: string, category: string[]) {
    let output = "";

    // Attempts to find the string if the category isn't provided
    if (!this.locales[language][category[0]] && !this.locales[fieldName]) {
      Object.getOwnPropertyNames(this.locales[language]).forEach((cat) => {
        Object.getOwnPropertyNames(this.locales[language][cat]).forEach((locale) => {
          if (locale === fieldName) output = this.locales[language][cat][locale];
        });
      });

      // Sets the output if the category exists
    } else if (this.locales[language][category[0]] && this.locales[language][category[0]][category[1]]) {
      output = this.locales[language][category[0]][category[1]];
      // Sets the locale if no category exists
    } else if (this.locales[language][fieldName]) {
      output = this.locales[language][fieldName];
    }

    return output;
  }
}
