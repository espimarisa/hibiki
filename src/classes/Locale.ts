/**
 * @file Locale system
 * @description Functions for locale and string parsing
 */

import type { HibikiClient } from "./Client";
import type { LocaleString, LocaleStrings } from "../typings/locales";
import { readFile, readdir } from "fs";
import config from "../../config.json";

export class LocaleSystem {
  locales: Record<string, string>;
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

  // Returns a string from a specific locale
  getLocale(language: string, fieldName: LocaleStrings, args?: { [x: string]: any } | undefined) {
    // Gets the string category
    const category = fieldName.split(".");
    let output = "";

    output = this._findLocaleString(language, fieldName, category);
    if (!output) output = this._findLocaleString(config.defaultLocale ? config.defaultLocale : "en", fieldName, category);

    // Sends an error if the string doesn't exist
    if (!output) throw new Error(`${fieldName} is missing in the string table for ${language || config.defaultLocale}`);

    // Passes arguments to the string
    if (args) {
      Object.getOwnPropertyNames(args).forEach((arg) => {
        // Handles plurals/non-plural and arguments/optionals
        const argumentRegex = new RegExp(`{${arg}}`);
        const pluralRegex = new RegExp(`{${arg}:#([^{}]+)#!([^{}]+)!(?:\\?([^{}]+)\\?)?}`);
        const optionalRegex = new RegExp(`({optional:${arg}:(.+)(?:{\\w})?})`);

        // Replaces optional strings with content
        const optional = optionalRegex.exec(output);
        if (optional) output = output.replace(optional[1], typeof args[arg] != "undefined" ? optional[2] : "");
        output = output.replace(argumentRegex, args[arg]);

        // Handles plurals
        const plurals = pluralRegex.exec(output);

        // Sends the output with the correct grammar
        if (plurals) {
          let plural = "";
          if (args[arg] === 1) plural = plurals[2];
          else if (plurals[3] && args[arg] >= 2 && args[arg] <= 4) plural = plurals[3];
          else plural = plurals[1];

          output = output.replace(plurals[0], plural);
        } else if (!plurals) output = output.replace(`{${arg}}`, args[arg]);
      });
    }

    // Handles optional input
    const optionalRegex = new RegExp(`({optional:.+:(.+)})`);
    const optional = optionalRegex.exec(output);
    if (optional) output = output.replace(optional[1], "");
    return output;
  }

  // Runs the function to return a locale string
  getLocaleFunction(language: string): LocaleString {
    return (fieldName: LocaleStrings, args?: Record<string, unknown>) => this.getLocale(language, fieldName, args);
  }

  // Returns what locale a user uses
  async getUserLocale(user: string, bot: HibikiClient, handler = false) {
    let locale = "";
    const userConfig = await bot.db.getUserConfig(user);
    if (userConfig?.locale) locale = userConfig.locale;
    else if (!userConfig?.locale && handler === false) locale = config.defaultLocale ? config.defaultLocale : "en";
    return locale;
  }

  private _findLocaleString(language: string, fieldName: string, category: string[]) {
    if (!this.locales?.[language]) return;
    let output = "";

    // Attempts to find the string if the category isn't provided
    if (!this.locales?.[language]?.[category[0]] && !this.locales?.[fieldName]) {
      Object.getOwnPropertyNames(this.locales[language]).forEach((cat) => {
        Object.getOwnPropertyNames(this.locales[language][cat]).forEach((locale) => {
          if (locale === fieldName) output = this.locales[language][cat][locale];
        });
      });

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
