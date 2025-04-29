/**
 * @file Extended typing definitions for i18next.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import type commands from "@/locales/en-US/commands.json";
import type common from "@/locales/en-US/common.json";
import type errors from "@/locales/en-US/errors.json";

/** A valid locale dictionary key included in a localization file. */
export type DictionaryKey =
  | `commands:${keyof typeof commands}`
  | `common:${keyof typeof common}`
  | `errors:${keyof typeof errors}`;

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    ns: ["commands", "common", "errors"];

    resources: {
      commands: typeof commands;
      common: typeof common;
      errors: typeof errors;
    };
  }
}
