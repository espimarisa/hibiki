/**
 * @file LocaleSystem
 * @description Handles loading, parsing, and getting locales
 */

import type { HibikiClient } from "./Client.js";
import type { getString, HibikiLocaleCode, HibikiDictionaryStrings } from "../typings/locales.js";
import type { PathLike } from "node:fs";
import { logger } from "../utils/logger.js";
import fs from "node:fs";

export class HibikiLocaleSystem {
  // A JSON object containing locale names & strings
  readonly locales: { [k: string]: { [k: string]: any } } = {};

  // The default locale to fall back to
  readonly defaultLocale: HibikiLocaleCode;

  // Creates a new localeSystem and loads the locales
  constructor(path: PathLike, defaultLocale: HibikiLocaleCode) {
    this.defaultLocale = defaultLocale;
    this._loadLocales(path);
  }

  // Gets an individual locale and parses the content returned
  public getLocale(language: HibikiLocaleCode, fieldName: HibikiDictionaryStrings, args?: { [x: string]: any }): string {
    const category = fieldName.split(".");
    let output = "";

    //  Gets the string output using the specified locale
    output = this._findLocaleString(language, fieldName, category);

    // If there's nothing for the specified locale, try the default one
    if (!output) output = this._findLocaleString(this.defaultLocale, fieldName, category);

    // Throws an error if the string wasn't found
    if (!output) {
      // Checks to see if the language is using the default locale
      const isDefault = language === this.defaultLocale;

      // Throws the error with what field is missing
      if (language) logger.warn(`${fieldName} is missing in the string table for ${language}.`);
      return isDefault ? fieldName : this.getLocale(this.defaultLocale, fieldName, args);
    }

    // Handles arguments provided
    if (args) {
      // Checks each argument in "args"
      for (const argument of Object.getOwnPropertyNames(args)) {
        // A regex for parsing provided arguments in a string
        const argumentRegex = new RegExp(`{${argument}}`);

        // A regex for parsing plural options in a string
        const pluralRegex = new RegExp(`{${argument}:#([^{}]+)#!([^{}]+)!(?:\\?([^{}]+)\\?)?}`);

        // A regex for parsing optional arguments in a string
        const optionalArgumentRegex = new RegExp(`({optional:${argument}:(.+)(?:{\\w})?})`);

        // Replaces optional strings with content
        const isOptional = optionalArgumentRegex.exec(output);

        // Optional argument support
        if (isOptional) output = output.replace(isOptional[1], args[argument] === undefined ? "" : isOptional[2]);
        output = output.replace(argumentRegex, args[argument]);

        // Checks to see if there are any plurals in the string
        const plurals = pluralRegex.exec(output);

        if (plurals) {
          // Plural option
          let plural = "";
          if (args[argument] === 1 || (args[argument] > 1 && args[argument] < 2)) plural = plurals[2];
          // Additional plural options for weird languages
          else if (plurals[3] && args[argument] >= 2 && args[argument] <= 4) plural = plurals[3];
          // Singular option
          else plural = plurals[1];

          // Fixes up plural
          output = output.replace(plurals[0], plural);
        } else if (!plurals) {
          // Replaces dummy arguments with provided ones
          output = output.replace(`{${argument}}`, args[argument]);
        }
      }
    }

    // A regex to check to see if any optional arguments were provided
    const optionalRegex = /({optional:.+:(.+)})/;

    // Checks to see if there are any optional items in the output
    const optional = optionalRegex.exec(output);

    // Replaces optional dummies with content; sends the output
    if (optional) output = output.replace(optional[1], "");
    return output;
  }

  // Returns an individual string
  public getLocaleFunction(language: HibikiLocaleCode): getString {
    return (fieldName: HibikiDictionaryStrings, args?: Record<string, any>) => this.getLocale(language, fieldName, args);
  }

  // Returns what locale a user has set in the database
  public async getUserLocale(user: DiscordSnowflake, bot: HibikiClient) {
    const userConfig = await bot.db.getUserConfig(user);
    return userConfig?.locale ?? this.defaultLocale;
  }

  // Loads all locales in a given path
  private _loadLocales(path: PathLike) {
    const files = fs.readdirSync(path, { withFileTypes: true, encoding: "utf8" });

    for (const file of files) {
      // Scans each locale file and loads it
      if (file.isDirectory()) this._loadLocales(`${path}/${file.name}`);
      else if (file.isFile()) {
        // Reads the actual locale file
        const subfile = fs.readFileSync(`${path}/${file.name}`)?.toString();

        // Creates an empty locale object
        const localeObject: Record<string, any> = {};

        // Parses the locale's JSON
        const data: Record<string, string> = JSON.parse(subfile);

        // Looks through each specific locale in the data object
        for (const locale of Object.entries(data)) {
          // Locale "categories"
          if (typeof locale[1] === "object") {
            localeObject[locale[0]] = {};

            // Reads each string in the category
            for (const string of Object.entries(locale[1])) {
              if ((string as [string, string])[1].length > 0) localeObject[locale[0]][string[0]] = string[1];
            }
          } else {
            // Replaces empty strings
            localeObject[locale[0]] = locale[1];
          }
        }

        // Loads the locale object
        this.locales[file.name.replace(/.json/, "")] = localeObject;
      }
    }
  }

  // Finds a specific locale string
  private _findLocaleString(language: HibikiLocaleCode, fieldName: HibikiDictionaryStrings, category: string[]) {
    if (!this.locales?.[language]) return;
    let output;

    // Attempts to find the string if the category isn't provided
    if (!this.locales?.[language]?.[category[0]] && !this.locales?.[fieldName]) {
      // Looks through each language
      for (const localeCategory of Object.getOwnPropertyNames(this.locales[language])) {
        // Looks through the categories
        for (const locale of Object.getOwnPropertyNames(this.locales[language][localeCategory])) {
          if (locale === fieldName) output = this.locales[language][localeCategory][locale];
        }
      }

      // Sets the output if the category exists
    } else if (this.locales?.[language]?.[category[0]] && this.locales?.[language]?.[category[0]]?.[category[1]]) {
      output = this.locales[language][category[0]][category[1]];
      // Sets the locale if no category exists
    } else if (this.locales?.[language]?.[fieldName]) {
      output = this.locales[language][fieldName];
    }

    return output;
  }
}
