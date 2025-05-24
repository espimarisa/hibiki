/**
 * @file Extended typing definitions for i18next.
 * @license zlib
 */

import type commands from "@/locales/en-US/commands.json";
import type common from "@/locales/en-US/common.json";
import type errors from "@/locales/en-US/errors.json";
import type { defaultNS, ns } from "@/utils/i18n.js";
import type { ParseKeys } from "i18next";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    ns: readonly typeof ns;
    returnNull: false;
    resources: {
      commands: readonly typeof commands;
      common: readonly typeof common;
      errors: readonly typeof errors;
    };
  }
}

/** A singular i18next Dictionary key identifier. */
export type DictionaryKey = ParseKeys<typeof ns, Record<never, never>, "">;
